const formData = new FormData();
// Add required fields
formData.append('name', 'Test Organic Apples');
formData.append('price', '5.99');
formData.append('category', 'Fruits');
formData.append('weight', '1 kg');
formData.append('seller', 'Farmer');
formData.append('uploader', 'Edwin');
formData.append('status', 'pending');
formData.append('farmerName', 'Edwin Farms');
// We won't append a real file, just a mock string since multer might reject it if not a file.. wait.
// Let's use node-fetch to send this.
// But node fetch FormData differs from browser FormData.

// An easier way: Let's just create a Mongoose doc directly to see if the Tracker finds it!
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/freshmart', { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
        const Product = require('./backend/models/Product.js');
        const p = new Product({
            name: "Direct DB Test Tracker",
            price: 15.00,
            category: "Vegetables",
            seller: "Farmer",
            uploader: "Edwin",
            image: "test.jpg", // Bypass multer
            status: "pending"
        });
        await p.save();
        console.log("Mock product saved for Edwin!");
        
        // Now query
        const found = await Product.find({ uploader: "Edwin" });
        console.log("Found in DB:", found.length, found.map(x => x.name));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
