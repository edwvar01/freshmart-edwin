const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get all orders (supports filtering by user)
router.get('/', async (req, res) => {
    try {
        let filter = {};
        if (req.query.user) {
            filter.customer = req.query.user;
        }
        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create an order
router.post('/', async (req, res) => {
    try {
        const latestOrder = await Order.findOne().sort({ createdAt: -1 });
        let newIdNum = 1;
        if (latestOrder && latestOrder.id && latestOrder.id.startsWith('ORD-')) {
            newIdNum = parseInt(latestOrder.id.split('-')[1]) + 1;
        }
        
        req.body.id = `ORD-${newIdNum.toString().padStart(3, '0')}`;
        
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update an order's status to Delivered
router.put('/:id/deliver', async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate(
            { id: req.params.id }, 
            { status: 'Delivered', badgeClass: 'badge-success' },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get all orders containing a farmer's products and calculate sales
router.get('/farmer/:uploader', async (req, res) => {
    try {
        const uploader = req.params.uploader;
        const orders = await Order.find({ 'items.uploader': uploader });
        
        let totalSales = 0;
        orders.forEach(order => {
           order.items.forEach(item => {
               if(item.uploader === uploader) {
                   // quantity fallback to 1 if missing
                   let q = (typeof item.quantity === 'number') ? item.quantity : 1;
                   // some cart engines store price as ₹15.00 string, strip symbols
                   let pStr = String(item.price).replace(/[^0-9.]/g, '');
                   let p = parseFloat(pStr) || 0;
                   totalSales += (p * q);
               }
           });
        });
        
        res.json({ totalSales });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
