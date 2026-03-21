const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/freshmart', { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
        const Product = require('./models/Product.js');
        
        const p = new Product({
            name: "Automated Tracking System Verified!",
            price: 5.99,
            category: "Vegetables",
            seller: "Farmer",
            uploader: "TestFarmer",
            image: "https://via.placeholder.com/150", 
            status: "pending"
        });
        
        await p.save();
        console.log("Mock product saved! ID:", p.id);
        
        // Now query
        const found = await Product.find({ uploader: "TestFarmer" });
        console.log("Found explicitly in tracking Database:", found.length, found.map(x => x.name));
        process.exit(0);
    })
    .catch(err => {
        console.error("Crash:", err);
        process.exit(1);
    });
