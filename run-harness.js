const fs = require('fs');
const path = require('path');

// 1. Rewrite Product.js to use pure async/await without next
const productPath = path.join(__dirname, 'backend', 'models', 'Product.js');
let productCode = fs.readFileSync(productPath, 'utf8');
productCode = productCode.replace(/productSchema\.pre\('save'[\s\S]*?\}\);/, `productSchema.pre('save', async function () {\n    console.log('[HOOK] Pre-save started');\n    if (!this.id) {\n        const lastProduct = await this.constructor.findOne().sort({ id: -1 });\n        this.id = lastProduct && lastProduct.id ? lastProduct.id + 1 : 1;\n    }\n    console.log('[HOOK] Pre-save finished');\n});`);
fs.writeFileSync(productPath, productCode);
console.log('--- Rewrote Product.js ---');

// 2. Start Server
const { spawn } = require('child_process');
const server = spawn('node', ['server.js'], { cwd: path.join(__dirname, 'backend') });

server.stdout.on('data', (data) => console.log(`[SERVER] ${data}`));
server.stderr.on('data', (data) => console.error(`[SERVER ERR] ${data}`));

setTimeout(async () => {
    console.log('--- Running mock upload ---');
    try {
        const form = new FormData();
        form.append('name', 'Test Farmer Product');
        form.append('price', '99');
        form.append('category', 'Vegetables');
        form.append('weight', '2 kg');
        form.append('farmer', 'Edwin Farm');
        form.append('seller', 'Farmer');
        form.append('status', 'pending');
        
        fs.writeFileSync('dummy2.jpg', 'fake image content');
        const buffer = fs.readFileSync('dummy2.jpg');
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        form.append('image', blob, 'dummy2.jpg');

        const res = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            body: form
        });
        
        const text = await res.text();
        console.log(`[CLIENT] Status: ${res.status}`);
        console.log(`[CLIENT] Response: ${text}`);
    } catch (err) {
        console.error('[CLIENT ERR]', err);
    }
    
    server.kill();
    process.exit(0);
}, 3000);
