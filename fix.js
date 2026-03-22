const fs = require('fs');

let content = fs.readFileSync('farmer-dashboard.html', 'utf8');

content = content.replace(
    /<label>Product Image URL<\/label>[\s\S]*?<input type="url" name="image"[\s\S]*?value=".*?" required[\s\S]*?placeholder=".*?">/m,
    `<label>Product Image</label>\n                                <input type="file" name="image" accept="image/*" required>`
);

content = content.replace(
    /const newProduct = \{[\s\S]*?status: "pending"\r?\n\s*\};\r?\n\r?\n\s*fetch\('http:\/\/localhost:5000\/api\/products', \{\r?\n\s*method: 'POST',\r?\n\s*headers: \{ 'Content-Type': 'application\/json' \},\r?\n\s*body: JSON\.stringify\(newProduct\)\r?\n\s*\}\)/m,
    `form.append('seller', 'Farmer');\n                form.append('status', 'pending');\n                if (form.get('category') !== 'Dairy') { form.delete('expiryDate'); }\n\n                fetch('https://freshmart-edwin.onrender.com/api/products', {\n                    method: 'POST',\n                    body: form\n                })`
);

fs.writeFileSync('farmer-dashboard.html', content);
console.log('Fixed farmer-dashboard.html');
