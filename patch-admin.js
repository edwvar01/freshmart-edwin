const fs = require('fs');

// 1. Update backend/routes/products.js
let routesPath = 'backend/routes/products.js';
let routes = fs.readFileSync(routesPath, 'utf8');
routes = routes.replace(
    /router\.put\('\/:id',\s*async\s*\(req,\s*res\)\s*=>\s*\{/,
    `router.put('/:id', upload.single('image'), async (req, res) => {\n        if (req.file) {\n            req.body.image = \`http://localhost:5000/uploads/\${req.file.filename}\`;\n        }`
);
fs.writeFileSync(routesPath, routes);

// 2. Update admin-dashboard.html
let adminHtmlPath = 'admin-dashboard.html';
let adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');
const newForm = `<form id="productForm">
                            <input type="hidden" id="productId" name="id">
                            <div class="form-group">
                                <label>Product Name</label>
                                <input type="text" id="productName" name="name" required>
                            </div>
                            <div class="form-group">
                                <label>Price (₹)</label>
                                <input type="number" step="0.01" id="productPrice" name="price" required>
                            </div>
                            <div class="form-group">
                                <label>Image File (Leave blank to keep current)</label>
                                <input type="file" id="productImage" name="image" accept="image/*">
                            </div>
                            <div class="form-group">
                                <label>Category</label>
                                <select id="productCategory" name="category" required>
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Fruits">Fruits</option>
                                    <option value="Dairy">Dairy</option>
                                    <option value="Grains">Grains</option>
                                    <option value="Organic Products">Organic Products</option>
                                </select>
                            </div>
                            <div class="form-group" style="display: flex; gap: 1rem;">
                                <div style="flex:1;">
                                    <label>Manufacturing Date (MFD)</label>
                                    <input type="date" id="productMfd" name="mfdDate" required style="width:100%; padding:0.8rem; border:1px solid #e2e8f0; border-radius:8px;">
                                </div>
                                <div style="flex:1;">
                                    <label>Expiry Date</label>
                                    <input type="date" id="productExpiry" name="expiryDate" required style="width:100%; padding:0.8rem; border:1px solid #e2e8f0; border-radius:8px;">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Seller Type / Farmer Name</label>
                                <input type="text" id="productSeller" name="seller" required>
                            </div>
                            <button type="submit" class="submit-btn">Save Product</button>
                        </form>`;
adminHtml = adminHtml.replace(/<form id="productForm">[\s\S]*?<\/form>/, newForm);
fs.writeFileSync(adminHtmlPath, adminHtml);

// 3. Update js/admin.js
let adminJsPath = 'js/admin.js';
let adminJs = fs.readFileSync(adminJsPath, 'utf8');

adminJs = adminJs.replace(
    /\/\/ Show\/Hide expiry field based on category[\s\S]*?expiryGroup\.style\.display = 'none';\s*}\s*}\);/,
    '// Expiry Date is now globally applicable'
);

const newSubmit = `form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('productId').value;
        const formData = new FormData(form);
        formData.append('status', 'approved');

        try {
            let url = 'https://freshmart-edwin.onrender.com/api/products';
            let method = 'POST';
            if (id) {
                url = \`https://freshmart-edwin.onrender.com/api/products/\${id}\`;
                method = 'PUT';
            } else {
                if(!document.getElementById('productImage').files.length) {
                    alert("Please upload an image for new products.");
                    return;
                }
            }
            
            const res = await fetch(url, {
                method: method,
                body: formData
            });
            if(!res.ok) throw new Error(await res.text());
            
            modal.classList.remove('active');
            renderProducts();
        } catch (err) {
            console.error("Error saving product:", err);
            alert("Failed to save product.");
        }
    });`;
adminJs = adminJs.replace(/form\.addEventListener\('submit'[\s\S]*?alert\("Failed to save product\."\)\s*\}\s*\}\);/, newSubmit);

adminJs = adminJs.replace(
    /window\.editProduct\s*=\s*async\s*\(id\)\s*=>\s*\{[\s\S]*?modal\.classList\.add\('active'\);\s*\}\s*catch\(err\)\s*\{[\s\S]*?\}\s*};\s*\}/,
    `window.editProduct = async (id) => {
        try {
            const res = await fetch(\`https://freshmart-edwin.onrender.com/api/products/\${id}\`);
            const product = await res.json();
            if (!product) return;

            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productImage').value = ''; 
            document.getElementById('productCategory').value = product.category || 'Vegetables';
            if(document.getElementById('productMfd')) document.getElementById('productMfd').value = product.mfdDate || '';
            if(document.getElementById('productExpiry')) document.getElementById('productExpiry').value = product.expiryDate || '';
            document.getElementById('productSeller').value = product.seller || '';

            document.getElementById('modalTitle').innerText = 'Edit Product';
            modal.classList.add('active');
        } catch(err) {
            console.error("Failed to load product for editing", err);
        }
    };
}`
);

fs.writeFileSync(adminJsPath, adminJs);
console.log("Admin refactored successfully.");
