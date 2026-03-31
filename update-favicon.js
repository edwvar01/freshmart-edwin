const fs = require('fs');
const path = require('path');

const dir = __dirname;
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const oldFavicon = 'href="assets/logo.jpg" type="image/jpeg"';
const newFavicon = 'href="assets/favicon.svg" type="image/svg+xml"';

htmlFiles.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes(oldFavicon)) {
        content = content.replace(oldFavicon, newFavicon);
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    } else {
        console.log(`Skipped ${file}`);
    }
});
