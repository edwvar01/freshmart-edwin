const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Get all approved products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ status: 'approved' }).sort({ _id: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all pending products (for Admin)
router.get('/pending', async (req, res) => {
    try {
        const products = await Product.find({ status: 'pending' });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all products by farmer (for Tracking System)
router.get('/farmer/:name', async (req, res) => {
    try {
        // Find products where farmerName or seller matches the given name
        const products = await Product.find({ $or: [{ farmerName: req.params.name }, { seller: req.params.name }, { uploader: req.params.name }] }).sort({ _id: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new product (Admin directly approves, Farmer adds as pending)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const productData = req.body;
        if (req.file) {
            productData.image = `http://localhost:5000/uploads/${req.file.filename}`;
        } else if (!productData.image) {
            // Fallback for cases where image wasn't uploaded but default is provided
            // productData.image is already in req.body
        }
        const product = new Product(productData);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        console.error("Product Error trace:", err.stack);
        res.status(400).json({ error: err.stack });
    }
});

// Update a product (e.g. edit or approve)
router.put('/:id', upload.single('image'), async (req, res) => {
        if (req.file) {
            req.body.image = `http://localhost:5000/uploads/${req.file.filename}`;
        }
    try {
        // Find by custom `id` field since frontend uses integers
        const product = await Product.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            req.body,
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a product (reject pending or delete approved)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ id: parseInt(req.params.id) });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
