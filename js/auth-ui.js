// auth-ui.js
document.addEventListener('DOMContentLoaded', () => {
    // Inject auth CSS styling for the dropdown
    const style = document.createElement('style');
    style.innerHTML = `
        .nav-profile-dropdown {
            position: relative;
            display: inline-block;
        }
        .profile-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--text-dark);
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px 10px;
            border-radius: 8px;
            transition: background 0.2s;
        }
        .profile-btn:hover {
            background: rgba(0,0,0,0.05);
        }
        .profile-avatar {
            width: 32px;
            height: 32px;
            background: var(--primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
        }
        .dropdown-menu {
            position: absolute;
            right: 0;
            top: 110%;
            background: white;
            min-width: 200px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border-radius: 12px;
            padding: 10px 0;
            display: none;
            flex-direction: column;
            z-index: 1000;
        }
        .nav-profile-dropdown:hover .dropdown-menu {
            display: flex;
        }
        .dropdown-header {
            padding: 10px 20px;
            border-bottom: 1px solid #eee;
            margin-bottom: 5px;
        }
        .dropdown-name {
            font-weight: 600;
            margin: 0;
            color: var(--text-dark);
        }
        .dropdown-role {
            font-size: 0.8rem;
            color: #888;
            text-transform: capitalize;
            margin: 0;
        }
        .dropdown-item {
            padding: 10px 20px;
            color: var(--text-dark);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: background 0.2s;
        }
        .dropdown-item:hover {
            background: #f8fafc;
            color: var(--primary);
        }
        .dropdown-item.logout {
            color: #ef4444;
            border-top: 1px solid #eee;
            margin-top: 5px;
        }
        .dropdown-item.logout:hover {
            background: #fef2f2;
        }
    `;
    document.head.appendChild(style);

    // Initialize UI Auth State
    function renderAuthUI() {
        const userJson = localStorage.getItem('fm_user');
        const userBtnContainer = document.querySelector('.desktop-user');
        const logoutBtn = document.querySelector('.logout-btn');

        if (!userBtnContainer) return; // For pages without navbar

        if (userJson) {
            const user = JSON.parse(userJson);
            const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';
            
            // Build the Amazon-style dropdown
            const dashboardLink = user.role === 'farmer' ? 'farmer-dashboard.html' : 'orders.html';
            const dashboardText = user.role === 'farmer' ? 'Dashboard' : 'My Orders';
            
            const dropdownHTML = `
                <div class="nav-profile-dropdown">
                    <button class="profile-btn">
                        <div class="profile-avatar">${avatarLetter}</div>
                        <span style="font-weight: 500;">Hello, ${user.name}</span>
                        <i data-lucide="chevron-down" width="16" height="16"></i>
                    </button>
                    <div class="dropdown-menu">
                        <div class="dropdown-header">
                            <p class="dropdown-name">${user.name}</p>
                            <p class="dropdown-role">${user.role} Account</p>
                        </div>
                        <a href="${dashboardLink}" class="dropdown-item">
                            <i data-lucide="${user.role === 'farmer' ? 'layout-dashboard' : 'package'}" width="16" height="16"></i>
                            ${dashboardText}
                        </a>
                        <a href="#" class="dropdown-item" onclick="handleLogout(event)">
                            <i data-lucide="log-out" width="16" height="16"></i>
                            Logout
                        </a>
                    </div>
                </div>
            `;
            
            // Replace the old user button with the new dropdown
            userBtnContainer.outerHTML = dropdownHTML;
            
            // Hide the old distinct logout button since it's in the dropdown now
            if (logoutBtn) logoutBtn.style.display = 'none';

            // Update the logo link if the user is a farmer
            const logo = document.querySelector('.navbar-logo');
            if (logo && user.role === 'farmer') {
                logo.href = 'farmer-dashboard.html';
            }

            if (window.lucide) window.lucide.createIcons();
            
            updateCartBadge();
        } else {
            // Not logged in: The user button should just link to index.html
            userBtnContainer.setAttribute('href', 'index.html');
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }

    renderAuthUI();
});

// Global Logout Function
window.handleLogout = function(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('fm_user');
    window.location.href = 'index.html';
};

// Global Cart Functionality
window.updateCartBadge = function() {
    const userJson = localStorage.getItem('fm_user');
    const badgeCount = document.getElementById('cart-badge-count') || document.querySelector('.cart-badge');
    
    if (!badgeCount) return;

    if (userJson) {
        const user = JSON.parse(userJson);
        const cartKey = 'fm_cart_' + user.name;
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        
        // Clean up legacy Base64 images from cart to fix page loading lag
        let needsSave = false;
        cart.forEach(item => {
            if (item.image && item.image.startsWith('data:image')) {
                item.image = `/api/products/${item._id || item.id}/image`;
                needsSave = true;
            }
        });
        if (needsSave) {
            localStorage.setItem(cartKey, JSON.stringify(cart));
        }
        
        // Calculate total items
        const totalItems = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
        badgeCount.innerText = totalItems;
        badgeCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
    } else {
        badgeCount.innerText = '0';
        badgeCount.style.display = 'none';
    }
};

window.addToCart = function(productStr) {
    const userJson = localStorage.getItem('fm_user');
    if (!userJson) {
        alert('Please log in to add items to your cart.');
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(userJson);
    const cartKey = 'fm_cart_' + user.name;
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const product = typeof productStr === 'string' ? JSON.parse(decodeURIComponent(productStr)) : productStr;

    // Check if it already exists using either _id (MongoDB) or id (Static auto-increment)
    const pId = product._id || product.id;
    const existingIndex = cart.findIndex(item => (item._id || item.id) === pId);
    
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        product.qty = 1;
        cart.push(product);
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    
    showToast(product.name + ' has been added to your cart!');
    window.updateCartBadge();
};

window.showToast = function(message) {
    const toast = document.createElement('div');
    toast.innerText = message;
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#2ECC71',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '10000',
        fontWeight: '500',
        transform: 'translateY(100px)',
        opacity: '0',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    });
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};
