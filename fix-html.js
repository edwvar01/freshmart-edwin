const fs = require('fs');
let html = fs.readFileSync('farmer-dashboard.html', 'utf8');
html = html.replace('name="farmer"', 'name="farmerName"');
fs.writeFileSync('farmer-dashboard.html', html);
console.log('Fixed farmerName input inside farmer-dashboard.html!');
