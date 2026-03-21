const fs = require('fs');

function globalReplace(file, regex, replacement) {
  if (fs.existsSync(file)) {
     let content = fs.readFileSync(file, 'utf8');
     const changed = content.replace(regex, replacement);
     fs.writeFileSync(file, changed);
  }
}

// 1. Strip ratings entirely
['products.html', 'farmers.html', 'home.html', 'index.html'].forEach(file => {
   globalReplace(file, /<div class="product-rating">[\s\S]*?<\/div>/g, '<!-- Ratings Removed -->');
});

// 2. Fix Farmer Dashboard
const farmerPath = 'farmer-dashboard.html';
if (fs.existsSync(farmerPath)) {
    let farmerHtml = fs.readFileSync(farmerPath, 'utf8');

    // Replace the hidden expiry date row with visible MFD and Expiry inputs
    farmerHtml = farmerHtml.replace(
        /<div class="form-row" id="farmerExpiryRow"[^>]*>[\s\S]*?<label>Expiry Date[\s\S]*?<\/div>\s*<\/div>/i,
        `<div class="form-row" id="farmerDatesRow">
                                <div class="input-block">
                                    <label>Manufacturing Date (MFD)</label>
                                    <input type="date" name="mfdDate" required>
                                </div>
                                <div class="input-block">
                                    <label>Expiry Date</label>
                                    <input type="date" name="expiryDate" required>
                                </div>
                            </div>`
    );

    // Remove the JS that hides the expiry date row
    farmerHtml = farmerHtml.replace(
        /\/\/ Show\/Hide expiry for farmers[\s\S]*?expiryRow\.style\.display = 'none';\s*\}\s*\}\);/i,
        '// Expiry logic securely overridden'
    );
    
    // Remove the form submit logic that deletes expiry Date
    farmerHtml = farmerHtml.replace(
        /if\s*\(\s*form\.get\('category'\)\s*!==\s*'Dairy'\s*\)\s*\{\s*form\.delete\('expiryDate'\);\s*\}/i,
        '// Validating all dates permanently'
    );

    fs.writeFileSync(farmerPath, farmerHtml);
    console.log('Farmer dashboard patched successfully with Regex!');
}
