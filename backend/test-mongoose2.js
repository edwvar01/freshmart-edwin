const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/freshmart').then(async () => {
    try {
        const p = new Product({
            name: 'Debug Test',
            price: 10,
            category: 'Veg',
            seller: 'Admin',
            image: 'http://loc'
        });
        await p.save();
        console.log('Saved successfully');
    } catch (err) {
        console.error('Error during save:', err.message);
    }
    process.exit(0);
});
