document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------
    // LOGIN LOGIC (admin-login.html)
    // ----------------------------------------
    const loginForm = document.getElementById('adminLoginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('adminUsername').value;
            const pass = document.getElementById('adminPassword').value;
            const errorMsg = document.getElementById('loginError');

            // Hardcoded Simple Admin Credentials
            if (user === 'admin' && pass === 'admin123') {
                sessionStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'admin-dashboard.html';
            } else {
                errorMsg.style.display = 'block';
                setTimeout(() => errorMsg.style.display = 'none', 3000);
            }
        });
    }

    // ----------------------------------------
    // DASHBOARD LOGIC (admin-dashboard.html)
    // ----------------------------------------
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        // Auth check
        if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
            window.location.href = 'admin-login.html';
        }

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            sessionStorage.removeItem('adminLoggedIn');
            window.location.href = 'admin-login.html';
        });

        // Tab Switching logic
        const menuItems = document.querySelectorAll('.menu-item');
        const tabContents = document.querySelectorAll('.tab-content');

        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active from all
                menuItems.forEach(mi => mi.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));

                // Add active to clicked and corresponding tab
                item.classList.add('active');
                const tabId = item.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');

                if (tabId === 'dashboard') {
                    updateDashboardStats();
                }
            });
        });

        // Initialize Products Manager
        initProductsManager();
        initOrdersManager();
    }
});

// ----------------------------------------
// MOCK DATA & LOCALSTORAGE LOGIC
// ----------------------------------------

const defaultProducts = [
    { id: 1, name: "Organic Tomatoes", price: 2.99, category: "Vegetables", seller: "Farmer", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=150&q=80" },
    { id: 2, name: "Fresh Milk", price: 3.49, category: "Dairy", seller: "Store", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&q=80" }
];

const mockOrders = [
    { id: "ORD-001", customer: "John Doe", date: "2026-03-10", status: "Delivered", total: 45.90, badgeClass: "badge-success" },
    { id: "ORD-002", customer: "Jane Smith", date: "2026-03-10", status: "Processing", total: 12.50, badgeClass: "badge-warning" },
    { id: "ORD-003", customer: "Bob Wilson", date: "2026-03-09", status: "Cancelled", total: 104.20, badgeClass: "badge-danger" }
];

function getProducts() {
    const prods = localStorage.getItem('fm_admin_products');
    if (prods) return JSON.parse(prods);
    localStorage.setItem('fm_admin_products', JSON.stringify(defaultProducts));
    return defaultProducts;
}

function saveProducts(products) {
    localStorage.setItem('fm_admin_products', JSON.stringify(products));
}

function initProductsManager() {
    const tbody = document.getElementById('productsTableBody');
    const modal = document.getElementById('productModal');
    const addBtn = document.getElementById('openAddProductModal');
    const closeBtn = document.getElementById('closeModal');
    const form = document.getElementById('productForm');

    // Render Products Table
    const renderProducts = () => {
        const products = getProducts();
        tbody.innerHTML = '';
        products.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${p.image}" class="product-thumb" alt="product"></td>
                <td><strong>${p.name}</strong></td>
                <td><span class="badge ${p.category === 'Vegetables' ? 'badge-success' : 'badge-warning'}">${p.category}</span></td>
                <td>$${parseFloat(p.price).toFixed(2)}</td>
                <td>${p.seller}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editProduct(${p.id})"><i data-lucide="edit" width="18" height="18"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteProduct(${p.id})"><i data-lucide="trash-2" width="18" height="18"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        lucide.createIcons();
        updateDashboardStats();
    };

    // Initialize Rendering
    renderProducts();

    // Modal behavior
    addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('productId').value = '';
        document.getElementById('modalTitle').innerText = 'Add New Product';
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Form Submit (Add/Edit)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('productId').value;
        const products = getProducts();

        const newProduct = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('productName').value,
            price: document.getElementById('productPrice').value,
            image: document.getElementById('productImage').value,
            category: document.getElementById('productCategory').value,
            seller: document.getElementById('productSeller').value,
        };

        if (id) {
            // Edit existing
            const index = products.findIndex(p => p.id === parseInt(id));
            if (index !== -1) products[index] = newProduct;
        } else {
            // Add new
            products.push(newProduct);
        }

        saveProducts(products);
        modal.classList.remove('active');
        renderProducts();
    });

    // Global scoping for onboard onclick events
    window.deleteProduct = (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            const products = getProducts().filter(p => p.id !== id);
            saveProducts(products);
            renderProducts();
        }
    };

    window.editProduct = (id) => {
        const product = getProducts().find(p => p.id === id);
        if (!product) return;

        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productSeller').value = product.seller;

        document.getElementById('modalTitle').innerText = 'Edit Product';
        modal.classList.add('active');
    };
}

function initOrdersManager() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    mockOrders.forEach(o => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${o.id}</strong></td>
            <td>${o.customer}</td>
            <td>${o.date}</td>
            <td><span class="badge ${o.badgeClass}">${o.status}</span></td>
            <td><strong>$${o.total.toFixed(2)}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

function updateDashboardStats() {
    const products = getProducts();
    const countEl = document.getElementById('totalProductsCount');
    if (countEl) {
        countEl.innerText = products.length;
    }
}
