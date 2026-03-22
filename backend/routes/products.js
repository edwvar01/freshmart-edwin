const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Configure multer storage (Memory storage for Base64 conversion)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

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
        const query = mongoose.Types.ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { id: parseInt(req.params.id) };
        const product = await Product.findOne(query);
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
            const base64Image = req.file.buffer.toString('base64');
            productData.image = `data:${req.file.mimetype};base64,${base64Image}`;
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
        const base64Image = req.file.buffer.toString('base64');
        req.body.image = `data:${req.file.mimetype};base64,${base64Image}`;
    } else {
        delete req.body.image;
    }
    try {
        const query = mongoose.Types.ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { id: parseInt(req.params.id) };
        const product = await Product.findOneAndUpdate(
            query,
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
        const query = mongoose.Types.ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { id: parseInt(req.params.id) };
        const product = await Product.findOneAndDelete(query);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
