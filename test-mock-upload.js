const fs = require('fs');

async function testUpload() {
    const form = new FormData();
    form.append('name', 'Test Farmer Product');
    form.append('price', '99');
    form.append('category', 'Vegetables');
    form.append('weight', '2 kg');
    form.append('farmer', 'Edwin Farm');
    form.append('seller', 'Farmer');
    form.append('status', 'pending');
    
    const buffer = fs.readFileSync('test.jpg');
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    form.append('image', blob, 'test.jpg');

    const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: form
    });
    
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
}

testUpload();
