const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/freshmart', { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
        const Product = require('./models/Product.js');
        
        // Find all products uploaded by a farmer that lack an 'uploader' tracking tag
        const unassignedProducts = await Product.find({ 
            seller: 'Farmer', 
            uploader: { $exists: false } 
        });
        
        console.log(`Found ${unassignedProducts.length} old products missing the uploader tag.`);
        
        // Backport them to the default 'Farmer' login name or whatever string applies
        let count = 0;
        for (let p of unassignedProducts) {
            p.uploader = 'Farmer'; // We'll assume they logged in as 'Farmer' like our subagent
            await p.save();
            count++;
        }
        
        console.log(`Successfully backported ${count} products to the tracking radar.`);
        process.exit(0);
    })
    .catch(err => {
        console.error("Database Patch Crash:", err);
        process.exit(1);
    });
