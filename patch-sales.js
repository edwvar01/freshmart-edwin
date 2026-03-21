const fs = require('fs');

// 1. Update Order.js
let orderPath = 'backend/models/Order.js';
let orderContent = fs.readFileSync(orderPath, 'utf8');
if (!orderContent.includes('items: { type: Array')) {
    orderContent = orderContent.replace(
        /badgeClass:\s*\{\s*type:\s*String\s*\}/,
        "badgeClass: { type: String },\n    items: { type: Array, default: [] }"
    );
    fs.writeFileSync(orderPath, orderContent);
}

// 2. Update checkout.html
let checkoutPath = 'checkout.html';
if (fs.existsSync(checkoutPath)) {
    let check = fs.readFileSync(checkoutPath, 'utf8');
    
    // Inject activeCart logic
    const oldOrderData = `const orderData = {
                    customer: customerName,
                    date: new Date().toISOString().split('T')[0],
                    status: 'Processing',
                    total: total,
                    badgeClass: 'badge-warning'
                };`;
    const newOrderData = `const activeCart = cartKey ? (JSON.parse(localStorage.getItem(cartKey)) || []) : [];
                const orderData = {
                    customer: customerName,
                    date: new Date().toISOString().split('T')[0],
                    status: 'Processing',
                    total: total,
                    badgeClass: 'badge-warning',
                    items: activeCart
                };`;
    check = check.split(oldOrderData).join(newOrderData);
    fs.writeFileSync(checkoutPath, check);
}

// 3. Update backend/routes/orders.js
let routesPath = 'backend/routes/orders.js';
let routes = fs.readFileSync(routesPath, 'utf8');
if (!routes.includes('/farmer/:uploader')) {
    const apiRoute = `
// Get all orders containing a farmer's products and calculate sales
router.get('/farmer/:uploader', async (req, res) => {
    try {
        const uploader = req.params.uploader;
        const orders = await Order.find({ 'items.uploader': uploader });
        
        let totalSales = 0;
        orders.forEach(order => {
           order.items.forEach(item => {
               if(item.uploader === uploader) {
                   // quantity fallback to 1 if missing
                   let q = (typeof item.quantity === 'number') ? item.quantity : 1;
                   // some cart engines store price as ₹15.00 string, strip symbols
                   let pStr = String(item.price).replace(/[^0-9.]/g, '');
                   let p = parseFloat(pStr) || 0;
                   totalSales += (p * q);
               }
           });
        });
        
        res.json({ totalSales });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;`;
    routes = routes.replace(/module\.exports\s*=\s*router;/, apiRoute);
    fs.writeFileSync(routesPath, routes);
}

// 4. Update farmer-dashboard.html
let farmerPath = 'farmer-dashboard.html';
if (fs.existsSync(farmerPath)) {
    let farm = fs.readFileSync(farmerPath, 'utf8');
    
    // Remote Storefront link
    farm = farm.replace(
        /<a href="products\.html" class="nav-link">Storefront<\/a>/g,
        '<!-- <a href="products.html" class="nav-link">Storefront</a> removed -->'
    );
    
    // Modify button text
    farm = farm.replace(
        /<button type="submit" class="btn btn-primary submit-product-btn">Upload to\s*Storefront<\/button>/g,
        '<button type="submit" class="btn btn-primary submit-product-btn" style="border-radius:24px;">Upload Product</button>'
    );
    
    // Modify Sales ID
    farm = farm.replace(
        /<h3 class="stat-value">₹4,250<\/h3>/g,
        '<h3 class="stat-value" id="farmerTotalSales">₹0</h3>'
    );
    
    // Inject loadSales function
    if (!farm.includes('function loadSales()')) {
        const newJS = `function loadSales() {
            const userJson = localStorage.getItem('fm_user');
            if(!userJson) return;
            const user = JSON.parse(userJson);
            fetch('http://localhost:5000/api/orders/farmer/' + encodeURIComponent(user.name))
                .then(res => res.json())
                .then(data => {
                    const el = document.getElementById('farmerTotalSales');
                    if (el) el.innerText = '₹' + (data.totalSales || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2});
                })
                .catch(err => console.error("Sales fetch err", err));
        }

        document.addEventListener('DOMContentLoaded', () => {
            loadMyUploads();
            loadSales();
        });

        // Suppress original DOMContentLoaded
        // lucide.createIcons();`;
        
        farm = farm.replace(/document\.addEventListener\('DOMContentLoaded',\s*loadMyUploads\);/, newJS);
    }
    fs.writeFileSync(farmerPath, farm);
}
console.log("Sales engine mapped perfectly!");
