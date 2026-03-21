const express = require('express');
const router = express.Router();
const User = require('../models/User');
// Note: using relative paths for models if we can find them, or defining quick query if they are absent.
const Product = require('../models/Product');
const Order = require('../models/Order');

router.get('/stats', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const activeFarmers = await User.countDocuments({ role: 'farmer' });
        const totalOrders = await Order.countDocuments();

        return res.json({
            success: true,
            totalProducts,
            activeFarmers,
            totalOrders
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
