const fs = require('fs');
let html = fs.readFileSync('farmer-dashboard.html', 'utf8');

// 1. Replace the inner HTML of the expiry row
const oldRow = `<div class="form-row" id="farmerExpiryRow" style="display: none;">
                                <div class="input-block">
                                    <label>Expiry Date (Required for Dairy)</label>
                                    <input type="date" name="expiryDate" id="farmerExpiryDate">
                                </div>
                            </div>`;
const newRow = `<div class="form-row" id="farmerDatesRow">
                                <div class="input-block">
                                    <label>Manufacturing Date (MFD)</label>
                                    <input type="date" name="mfdDate" required>
                                </div>
                                <div class="input-block">
                                    <label>Expiry Date</label>
                                    <input type="date" name="expiryDate" required>
                                </div>
                            </div>`;
html = html.split(oldRow).join(newRow);

// 2. Replace the JS
const oldJS = `// Show/Hide expiry for farmers
        const categorySelect = document.querySelector('select[name="category"]');
        const expiryRow = document.getElementById('farmerExpiryRow');

        categorySelect.addEventListener('change', () => {
            if (categorySelect.value === 'Dairy') {
                expiryRow.style.display = 'block';
            } else {
                expiryRow.style.display = 'none';
            }
        });`;
html = html.split(oldJS).join('// Expiry row globally mandatory');

fs.writeFileSync('farmer-dashboard.html', html);
console.log("Replaced successfully!");
