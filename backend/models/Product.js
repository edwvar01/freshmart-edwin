const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: Number },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    seller: { type: String, required: true },
    uploader: { type: String },
    image: { type: String, required: true },
    mfdDate: { type: String, default: null },
    expiryDate: { type: String, default: null },
    farmerName: { type: String }, // For pending products
    weight: { type: String },
    status: { type: String, default: 'approved' }
}, { timestamps: true });

// Auto-increment ID implementation for frontend compatibility
productSchema.pre('save', async function () {
    if (!this.id) {
        const lastProduct = await this.constructor.findOne().sort({ id: -1 });
        this.id = lastProduct && lastProduct.id ? lastProduct.id + 1 : 1;
    }
});

module.exports = mongoose.model('Product', productSchema);
