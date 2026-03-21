const fs = require('fs');

// 1. Update Product Model
let modelPath = 'backend/models/Product.js';
let model = fs.readFileSync(modelPath, 'utf8');
if (!model.includes('uploader: { type: String }')) {
    model = model.replace(
        /seller:\s*\{\s*type:\s*String,\s*required:\s*true\s*\},/,
        "seller: { type: String, required: true },\n    uploader: { type: String },"
    );
    fs.writeFileSync(modelPath, model);
}

// 2. Update Product Routes
let routesPath = 'backend/routes/products.js';
let routes = fs.readFileSync(routesPath, 'utf8');
routes = routes.replace(
    /\{\s*\$or:\s*\[\{\s*farmerName:\s*req\.params\.name\s*\},\s*\{\s*seller:\s*req\.params\.name\s*\}\]\s*\}/,
    '{ $or: [{ farmerName: req.params.name }, { seller: req.params.name }, { uploader: req.params.name }] }'
);
fs.writeFileSync(routesPath, routes);

// 3. Update Farmer Dashboard
let dashPath = 'farmer-dashboard.html';
let dash = fs.readFileSync(dashPath, 'utf8');

// A. Change 'Pending Approval' label to 'Processing'
dash = dash.replace(
    /let\s+statusText\s*=\s*'Pending\s+Approval';/,
    "let statusText = 'Processing';"
);
dash = dash.replace(
    /let\s+statusColor\s*=\s*'#f59e0b';|let\s+statusColor\s*=\s*'#3b82f6';/,
    "let statusColor = '#f59e0b';"
);

// B. Inject 'uploader' identity logic into POST route body
const oldPost = `                // Create new product object
                const form = new FormData(uploadForm);
                form.append('seller', 'Farmer');
                form.append('status', 'pending');`;

const newPost = `                // Create new product object
                const form = new FormData(uploadForm);
                form.append('seller', 'Farmer');
                form.append('status', 'pending');
                const userJson = localStorage.getItem('fm_user');
                if (userJson) {
                    const u = JSON.parse(userJson);
                    form.append('uploader', u.name);
                }`;

dash = dash.split(oldPost).join(newPost);
fs.writeFileSync(dashPath, dash);

console.log('Farmer dashboard and APIs decoupled and patched!');
