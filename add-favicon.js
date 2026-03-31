const fs = require('fs');
const path = require('path');

const dir = __dirname;
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const faviconTag = '\n    <link rel="icon" href="assets/logo.jpg" type="image/jpeg">';

htmlFiles.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Clean up malformed head tags
    content = content.replace(/<\/head><\/svg>">/g, '');
    content = content.replace(/<\/head><\/svg>/g, '');
    content = content.replace(/(<\/head>\s*)+/g, '</head>\n');

    if (!content.includes('<link rel="icon"')) {
        // Insert favicon right before </head>
        content = content.replace('</head>', `${faviconTag}\n</head>`);
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    } else {
        console.log(`Skipped ${file} (already has icon)`);
    }
});
