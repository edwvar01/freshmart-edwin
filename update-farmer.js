const fs = require('fs');
let html = fs.readFileSync('farmer-dashboard.html', 'utf8');

// Inject Tracking Section
html = html.replace(
    /<\/div>(\s*)<\/div>(\s*)<\/main>/m,
    `</div>\n\n                    <div class="tracking-section" style="margin-top: 3rem;">\n                        <div class="upload-header">\n                            <h2><i data-lucide="list" width="24" height="24"></i> My Uploads Tracking</h2>\n                        </div>\n                        <div class="tracking-container" style="background: white; border-radius: 24px; padding: 2rem; box-shadow: 0 4px 25px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; overflow-x: auto;">\n                            <table style="width: 100%; border-collapse: collapse; min-width: 600px;">\n                                <thead>\n                                    <tr style="text-align: left; border-bottom: 2px solid #f1f5f9; color: #64748b;">\n                                        <th style="padding: 1rem;">Product Segment</th>\n                                        <th style="padding: 1rem;">Category</th>\n                                        <th style="padding: 1rem;">Price</th>\n                                        <th style="padding: 1rem;">Status</th>\n                                    </tr>\n                                </thead>\n                                <tbody id="farmerTrackingBody">\n                                    <tr><td colspan="4" style="text-align: center; padding: 2rem; color: #94a3b8;">Loading tracking data...</td></tr>\n                                </tbody>\n                            </table>\n                        </div>\n                    </div>\n\n                </div>\n            </main>`
);

// Inject Full Screen Tick HTML before </body>
html = html.replace(
    /<\/body>/m,
    `    <div id="successOverlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); z-index: 9999; flex-direction: column; justify-content: center; align-items: center;">\n        <div class="success-animation">\n            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">\n                <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>\n                <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>\n            </svg>\n        </div>\n        <h2 style="color: #2ECC71; margin-top: 20px; font-size: 2.5rem; font-weight: 800;">Upload Successful!</h2>\n        <p style="color: #64748b; font-size: 1.1rem;">Your product is now awaiting admin approval.</p>\n    </div>\n</body>`
);

// Inject loadMyUploads logic and update submit fetch
const successAlertRegex = /alert\('Your product has been sent to the Admin for approval! It will appear on the storefront once verified.'\);\s*uploadForm\.reset\(\);/;
const fetchScriptUpdate = html.replace(successAlertRegex, `const overlay = document.getElementById('successOverlay');\n                    overlay.style.display = 'flex';\n                    setTimeout(() => {\n                        overlay.style.display = 'none';\n                        uploadForm.reset();\n                        loadMyUploads();\n                    }, 2500);`);

const trackingScript = `
        function loadMyUploads() {
            const userJson = localStorage.getItem('fm_user');
            if (!userJson) return;
            const user = JSON.parse(userJson);
            fetch('https://freshmart-edwin.onrender.com/api/products/farmer/' + user.name)
                .then(res => res.json())
                .then(products => {
                    const tbody = document.getElementById('farmerTrackingBody');
                    tbody.innerHTML = '';
                    if (products.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No products uploaded yet.</td></tr>';
                        return;
                    }
                    products.forEach(p => {
                        let statusColor = '#3b82f6';
                        let statusText = 'Pending Approval';
                        if (p.status === 'approved') {
                            statusColor = '#2ECC71';
                            statusText = 'Approved';
                        } else if (p.status === 'rejected') {
                            statusColor = '#ef4444';
                            statusText = 'Rejected';
                        }
                        const tr = document.createElement('tr');
                        tr.innerHTML = \`
                            <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <img src="\${p.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                                    <strong>\${p.name}</strong>
                                </div>
                            </td>
                            <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">\${p.category}</td>
                            <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9; font-weight: 600;">₹\${p.price}</td>
                            <td style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">
                                <span style="background: \${statusColor}15; color: \${statusColor}; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">\${statusText}</span>
                            </td>
                        \`;
                        tbody.appendChild(tr);
                    });
                });
        }
        document.addEventListener('DOMContentLoaded', loadMyUploads);
        lucide.createIcons();`;

const finalHTML = fetchScriptUpdate.replace(/lucide\.createIcons\(\);/g, trackingScript);

fs.writeFileSync('farmer-dashboard.html', finalHTML);
console.log('Farmer dashboard updated via script!');
