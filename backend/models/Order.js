const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    id: { type: String, required: true }, // e.g. "ORD-001"
    customer: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, required: true }, // "Delivered", "Processing", "Cancelled"
    total: { type: Number, required: true },
    badgeClass: { type: String },
    items: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
