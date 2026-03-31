const mongoose = require('mongoose');
const Order = require('./backend/models/Order');

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/freshmart');
    console.log('Connected to DB');

    // Create a dummy order
    const order = new Order({
        id: 'ORD-999',
        customer: 'Test User',
        date: new Date().toISOString(),
        status: 'Processing',
        total: 100,
        items: [{
            name: 'Test Carrot',
            uploader: 'Test Farmer',
            quantity: 2,
            price: 50
        }]
    });
    
    await order.save();
    console.log('Created Order:', order.id);
    
    // Now simulate uploading a photo
    // Let's use the actual express app to test it properly
    console.log('Done creating order. Please run the server and test the endpoint with a client.');
    mongoose.disconnect();
}
test();
