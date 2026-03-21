const fs = require('fs');
let html = fs.readFileSync('farmer-dashboard.html', 'utf8');

html = html.replace(
    /\.then\(res => res\.json\(\)\)\r?\n\s*\.then\(data => \{/m,
    `.then(async res => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Upload failed');
                    return data;
                })
                .then(data => {`
);

fs.writeFileSync('farmer-dashboard.html', html);
console.log('Fixed fetch handler');
