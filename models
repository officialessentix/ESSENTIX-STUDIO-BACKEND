const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true }, // 'shirt', 'tee', or 'sweat'
    image: { type: String, required: true },
    stock: { type: Number, default: 20 }
});

module.exports = mongoose.model('Product', productSchema);
