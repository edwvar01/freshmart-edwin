const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const multer = require('multer');

// Configure multer storage (Memory storage for Base64 conversion)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all orders (supports filtering by user)
router.get('/', async (req, res) => {
    try {
        let filter = {};
        if (req.query.user) {
            filter.customer = req.query.user;
        }
        const orders = await Order.find(filter).select('-items.image').sort({ createdAt: -1 });
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
        if (latestOrder && latestOrder.id && typeof latestOrder.id === 'string' && latestOrder.id.startsWith('ORD-')) {
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
            { returnDocument: 'after' }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete (cancel) an order
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findOneAndDelete({ id: req.params.id });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
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

// Get all orders containing a farmer's products (Full orders)
router.get('/farmer-orders/:uploader', async (req, res) => {
    try {
        const uploader = req.params.uploader;
        const orders = await Order.find({ 'items.uploader': uploader }).sort({ createdAt: -1 }).lean();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Quality Verification Photo
router.put('/:id/quality-photo', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }
        const base64Image = req.file.buffer.toString('base64');
        const qualityPhoto = `data:${req.file.mimetype};base64,${base64Image}`;
        
        const query = { id: req.params.id };
        const order = await Order.findOneAndUpdate(
            query,
            { qualityPhoto: qualityPhoto, qualityStatus: 'Uploaded' },
            { returnDocument: 'after' }
        );
        
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Quality Verification Photo
router.get('/:id/quality-photo', async (req, res) => {
    try {
        const order = await Order.findOne({ id: req.params.id }).select('qualityPhoto').lean();
        if (!order || !order.qualityPhoto) {
            return res.status(404).json({ message: 'Photo not found' });
        }
        
        const matches = order.qualityPhoto.match(/^data:([a-zA-Z0-9-+\/]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
            if (order.qualityPhoto.startsWith('http') || order.qualityPhoto.startsWith('/')) {
                return res.redirect(order.qualityPhoto);
            }
            return res.status(400).json({ message: 'Invalid image format' });
        }
        
        const mimeType = matches[1];
        const base64Data = matches[2];
        const binaryData = Buffer.from(base64Data, 'base64');
        
        res.set('Content-Type', mimeType);
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(binaryData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
