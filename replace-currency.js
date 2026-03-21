const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('backend')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.html') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(__dirname);
let totalVarsReplaced = 0;
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;

    content = content.replace(/\$([0-9]+)/g, '₹₹1');
    content = content.replace(/\$ ([0-9]+)/g, '₹ ₹1');
    content = content.replace(/>\$</g, '>₹<');
    content = content.replace(/\$\$\{/g, '₹${');
    content = content.replace(/'\$'/g, "'₹'");
    content = content.replace(/"\$"/g, '"₹"');

    // Also catch $ {product.price} just in case space was added
    content = content.replace(/\$ \$\{/g, '₹ ${');

    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Updated:', path.basename(f));
        totalVarsReplaced++;
    }
});
console.log('Done replacing currency in', totalVarsReplaced, 'files.');
