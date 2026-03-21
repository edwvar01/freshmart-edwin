const fs = require('fs');

const fPath = 'farmer-dashboard.html';
if (fs.existsSync(fPath)) {
    let fHtml = fs.readFileSync(fPath, 'utf8');

    // Make sure we haven't already added it
    if (!fHtml.includes("form.append('uploader', u.name);")) {
        fHtml = fHtml.replace(
            /form\.append\('status',\s*'pending'\);/g,
            `form.append('status', 'pending');\n                const userJson = localStorage.getItem('fm_user');\n                if (userJson) {\n                    const u = JSON.parse(userJson);\n                    form.append('uploader', u.name);\n                }`
        );
        fs.writeFileSync(fPath, fHtml);
        console.log("Successfully injected uploader into FormData submit block!");
    } else {
        console.log("Uploader already exists.");
    }
}
