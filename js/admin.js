window.showModernConfirm = function(title, message, type, onYes) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-confirm-overlay';
    
    const isSuccess = type === 'success';
    const iconClass = isSuccess ? 'success' : '';
    const btnClass = isSuccess ? 'success' : 'danger';
    const lucideIcon = isSuccess ? 'check-circle' : 'alert-circle';
    
    overlay.innerHTML = `
        <div class="custom-confirm-modal">
            <div class="confirm-icon ${iconClass}"><i data-lucide="${lucideIcon}" width="32" height="32"></i></div>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="confirm-actions">
                <button class="confirm-btn no-btn">No, Cancel</button>
                <button class="confirm-btn yes-btn ${btnClass}">Yes, Proceed</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    if (window.lucide) window.lucide.createIcons();
    
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
    
    const close = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };
    
    overlay.querySelector('.no-btn').onclick = close;
    overlay.querySelector('.yes-btn').onclick = () => {
        close();
        onYes();
    };
};

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------
    // LOGIN LOGIC (admin-login.html)
    // ----------------------------------------
    const loginForm = document.getElementById('adminLoginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = document.getElementById('adminUsername').value;
            const pass = document.getElementById('adminPassword').value;
            const errorMsg = document.getElementById('loginError');

            try {
                const res = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user, password: pass, type: 'admin' })
                });
                const data = await res.json();

                if (data.success) {
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    sessionStorage.setItem('adminToken', data.token);
                    window.location.href = 'admin-dashboard.html';
                } else {
                    errorMsg.style.display = 'block';
                    setTimeout(() => errorMsg.style.display = 'none', 3000);
                }
            } catch(err) {
                console.error("Login failed:", err);
                errorMsg.innerText = "Server connection failed";
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
            sessionStorage.removeItem('adminToken');
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

        // Initialize Managers
        initProductsManager();
        initOrdersManager();
        initPendingProductsManager();
    }
});

// ----------------------------------------
// API CALLS LOGIC
// ----------------------------------------

async function getProducts() {
    try {
        const res = await fetch('http://localhost:5000/api/products');
        return await res.json();
    } catch(err) {
        console.error("Error fetching products", err);
        return [];
    }
}

async function getPendingProducts() {
    try {
        const res = await fetch('http://localhost:5000/api/products/pending');
        return await res.json();
    } catch(err) {
        console.error("Error fetching pending products", err);
        return [];
    }
}

function initProductsManager() {
    const tbody = document.getElementById('productsTableBody');
    const modal = document.getElementById('productModal');
    const addBtn = document.getElementById('openAddProductModal');
    const closeBtn = document.getElementById('closeModal');
    const form = document.getElementById('productForm');
    const categorySelect = document.getElementById('productCategory');
    const expiryGroup = document.getElementById('expiryGroup');

    // Expiry Date is now globally applicable

    // Render Products Table
    const renderProducts = async () => {
        const products = await getProducts();
        tbody.innerHTML = '';
        products.forEach(p => {
            const tr = document.createElement('tr');
            const pid = p._id || p.id;
            const mfdText = (p.mfdDate || p.mfd) ? `<br><small style="color: #64748b;">MFD: ${p.mfdDate || p.mfd}</small>` : '';
            const expText = (p.expiryDate || p.expiry) ? `<br><small style="color: #64748b;">Exp: ${p.expiryDate || p.expiry}</small>` : '';
            tr.innerHTML = `
                <td><img src="${p.image}" class="product-thumb" alt="product"></td>
                <td><strong>${p.name}</strong>${mfdText}${expText}</td>
                <td><span class="badge ${p.category === 'Vegetables' ? 'badge-success' : 'badge-warning'}">${p.category}</span></td>
                <td>₹${parseFloat(p.price).toFixed(2)}</td>
                <td>${p.seller}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editProduct('${pid}')"><i data-lucide="edit" width="18" height="18"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteProduct('${pid}')"><i data-lucide="trash-2" width="18" height="18"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        if (window.lucide) lucide.createIcons();
        updateDashboardStats(products.length);
    };

    // Initialize Rendering
    renderProducts();

    // Modal behavior
    addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('productId').value = '';
        if (document.getElementById('expiryGroup')) document.getElementById('expiryGroup').style.display = 'block';
        if (document.getElementById('mfdGroup')) document.getElementById('mfdGroup').style.display = 'block';
        if (document.getElementById('currentImageText')) document.getElementById('currentImageText').style.display = 'none';
        if (document.getElementById('currentImagePreview')) document.getElementById('currentImagePreview').style.display = 'none';
        document.getElementById('modalTitle').innerText = 'Add New Product';
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Form Submit (Add/Edit)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('productId').value;
        const formData = new FormData(form);
        formData.append('status', 'approved');

        try {
            let url = 'http://localhost:5000/api/products';
            let method = 'POST';
            if (id) {
                url = `http://localhost:5000/api/products/${id}`;
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
    });

    // Make renderProducts globally available for other managers to call
    window.renderAdminProductsTable = renderProducts;

    // Global scoping for onboard onclick events
    window.deleteProduct = async (id) => {
        showModernConfirm('Delete Product?', 'Are you sure you want to permanently delete this product?', 'danger', async () => {
            try {
                await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
                renderProducts();
            } catch(err) {
                console.error("Failed to delete", err);
            }
        });
    };

    window.editProduct = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}`);
            const product = await res.json();
            if (!product) return;

            document.getElementById('productId').value = product.id || product._id || '';
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productImage').value = ''; 
            if(document.getElementById('currentImagePreview')) {
                const preview = document.getElementById('currentImagePreview');
                if (product.image) {
                    preview.src = product.image;
                    preview.style.display = 'block';
                } else {
                    preview.style.display = 'none';
                }
            }
            if(document.getElementById('currentImageText')) {
                document.getElementById('currentImageText').style.display = 'block';
                document.getElementById('currentImageText').innerText = 'Leave empty to keep current image: ' + (product.image ? product.image.split('/').pop() : 'None');
            }
            document.getElementById('productCategory').value = product.category || 'Vegetables';
            if(document.getElementById('productMfd')) document.getElementById('productMfd').value = product.mfdDate || product.mfd || '';
            if(document.getElementById('productExpiry')) document.getElementById('productExpiry').value = product.expiryDate || product.expiry || '';
            document.getElementById('productSeller').value = product.seller || 'Store';

            document.getElementById('modalTitle').innerText = 'Edit Product';
            modal.classList.add('active');
        } catch(err) {
            console.error("Failed to load product for editing", err);
        }
    };

    const imgInput = document.getElementById('productImage');
    if (imgInput) {
        imgInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const preview = document.getElementById('currentImagePreview');
            if (file && preview) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    preview.src = evt.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function initPendingProductsManager() {
    const tbody = document.getElementById('pendingTableBody');
    if (!tbody) return;

    window.renderPendingProducts = async () => {
        const pending = await getPendingProducts();
        tbody.innerHTML = '';

        if (pending.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--admin-text-light);">No pending products require approval.</td></tr>`;
            return;
        }

        pending.forEach(p => {
            const tr = document.createElement('tr');
            const pid = p._id || p.id;
            tr.innerHTML = `
                <td><img src="${p.image}" class="product-thumb" alt="product"></td>
                <td><strong>${p.name}</strong><br><small style="color:var(--admin-text-light)">${p.weight || 'N/A'}</small></td>
                <td><span class="badge ${p.category === 'Vegetables' ? 'badge-success' : 'badge-warning'}">${p.category}</span></td>
                <td>₹${parseFloat(p.price).toFixed(2)}</td>
                <td>${p.farmerName || p.seller}</td>
                <td>
                    <button class="action-btn" style="color: #2ECC71;" onclick="approveProduct('${pid}')" title="Approve"><i data-lucide="check-circle" width="20" height="20"></i></button>
                    <button class="action-btn delete-btn" onclick="rejectProduct('${pid}')" title="Reject"><i data-lucide="x-circle" width="20" height="20"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        if(window.lucide) lucide.createIcons();
    };

    renderPendingProducts();

    window.approveProduct = async (id) => {
        showModernConfirm('Approve Product?', 'Are you sure you want to approve this product for the storefront?', 'success', async () => {
            try {
                await fetch(`http://localhost:5000/api/products/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'approved' })
                });
                renderPendingProducts();
                if (window.renderAdminProductsTable) window.renderAdminProductsTable();
            } catch(err) {
                console.error("Approval failed", err);
            }
        });
    };

    window.rejectProduct = async (id) => {
        showModernConfirm('Reject Product?', 'Are you sure you want to REJECT this pending product?', 'danger', async () => {
            try {
                await fetch(`http://localhost:5000/api/products/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'rejected' })
                });
                renderPendingProducts();
            } catch(err) {
                console.error("Rejection failed", err);
            }
        });
    };
}

function initOrdersManager() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    window.markOrderDelivered = async (id) => {
        showModernConfirm('Mark as Delivered?', 'Are you sure you want to mark this order as delivered? This will be visible to the customer.', 'success', async () => {
            try {
                await fetch(`http://localhost:5000/api/orders/${id}/deliver`, { method: 'PUT' });
                renderOrders();
            } catch(err) {
                console.error("Failed to mark as delivered", err);
            }
        });
    };

    const renderOrders = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/orders');
            const orders = await res.json();
            
            tbody.innerHTML = '';
            
            if(orders.length === 0) {
                 tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No orders yet.</td></tr>`;
                 return;
            }
            
            orders.forEach(o => {
                const tr = document.createElement('tr');
                const isDelivered = o.status === 'Delivered';
                const actionBtn = isDelivered 
                    ? `<span style="color:#2ECC71; font-size:0.85rem; font-weight:600;"><i data-lucide="check-check" width="16" height="16"></i> Delivered</span>` 
                    : `<button class="action-btn" style="color: #2ECC71; background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.3); padding: 0.3rem 0.8rem; border-radius: 5px; font-size: 0.75rem; width: auto;" onclick="markOrderDelivered('${o.id}')" title="Mark Delivered">Deliver</button>`;

                tr.innerHTML = `
                    <td><strong>${o.id}</strong></td>
                    <td>${o.customer}</td>
                    <td>${o.date}</td>
                    <td><span class="badge ${o.badgeClass || 'badge-warning'}">${o.status}</span></td>
                    <td><strong>₹${o.total.toFixed(2)}</strong></td>
                    <td>${actionBtn}</td>
                `;
                tbody.appendChild(tr);
            });
            if (window.lucide) window.lucide.createIcons();
        } catch(err) {
            console.error("Failed to load orders", err);
        }
    }
    
    renderOrders();
}

async function updateDashboardStats(preloadedCount) {
    try {
        const res = await fetch('http://localhost:5000/api/admin/stats');
        const data = await res.json();
        if (data.success) {
            const prodEl = document.getElementById('totalProductsCount');
            const ordersEl = document.getElementById('totalOrdersCount');
            const farmersEl = document.getElementById('activeFarmersCount');

            if (prodEl) prodEl.innerText = data.totalProducts;
            if (ordersEl) ordersEl.innerText = data.totalOrders;
            if (farmersEl) farmersEl.innerText = data.activeFarmers;
        }
    } catch (err) {
        console.error("Dashboard stats error", err);
    }
}
