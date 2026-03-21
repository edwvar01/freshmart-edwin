const fs = require('fs');
let html = fs.readFileSync('products.html', 'utf8');
html = html.replace('window.addToCart(encodeURIComponent(JSON.stringify(p)));', "window.addToCart('${encodeURIComponent(JSON.stringify(p))}');");
fs.writeFileSync('products.html', html);
console.log('Fixed interpolation bug in products.html');
