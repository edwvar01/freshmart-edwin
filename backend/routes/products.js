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
        const products = await Product.find({ status: 'approved' }).select('-image').sort({ _id: -1 }).lean();
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productsWithImageUrls = products.map(product => ({
            ...product,
            image: `${baseUrl}/api/products/${product._id}/image`
        }));
        res.json(productsWithImageUrls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all pending products (for Admin)
router.get('/pending', async (req, res) => {
    try {
        const products = await Product.find({ status: 'pending' }).select('-image').lean();
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productsWithImageUrls = products.map(product => ({
            ...product,
            image: `${baseUrl}/api/products/${product._id}/image`
        }));
        res.json(productsWithImageUrls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all products by farmer (for Tracking System)
router.get('/farmer/:name', async (req, res) => {
    try {
        // Find products where farmerName or seller matches the given name
        const products = await Product.find({ $or: [{ farmerName: req.params.name }, { seller: req.params.name }, { uploader: req.params.name }] }).select('-image').sort({ _id: -1 }).lean();
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productsWithImageUrls = products.map(product => ({
            ...product,
            image: `${baseUrl}/api/products/${product._id}/image`
        }));
        res.json(productsWithImageUrls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single product
router.get('/:id', async (req, res) => {
    try {
        const query = mongoose.Types.ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { id: parseInt(req.params.id) };
        const product = await Product.findOne(query).select('-image').lean();
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        product.image = `${baseUrl}/api/products/${product._id}/image`;
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
            { returnDocument: 'after' }
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

// Get product image
router.get('/:id/image', async (req, res) => {
    try {
        const query = mongoose.Types.ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { id: parseInt(req.params.id) };
        const product = await Product.findOne(query).select('image');
        if (!product || !product.image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        
        // Image format: 'data:image/jpeg;base64,/9j/4AAQSkZ...'
        const matches = product.image.match(/^data:([a-zA-Z0-9-+\/]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
            // Fallback if it's not base64 but a direct URL string
            if (product.image.startsWith('http') || product.image.startsWith('/')) {
                return res.redirect(product.image);
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
