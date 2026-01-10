const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Product = require('./models/product'); 

const app = express();

// ✅ CORS Setup: allow both production and local testing
const allowedOrigins = [
    'https://essentix-studio-frontend.vercel.app', // Production frontend
    'http://127.0.0.1:5500',                        // Live Server local testing
    'http://localhost:5500'                         // Localhost fallback
];

app.use(cors({
    origin: function(origin, callback){
        // allow requests with no origin (like curl, Postman)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = 'CORS policy: This origin is not allowed.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));





app.use(express.json());

app.use(express.urlencoded({ extended: true }));



// 1. CONNECT TO MONGO
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ VAULT ONLINE"))
    .catch(err => console.error("❌ CONNECTION ERROR:", err));

// 2. DEFINE THE ORDER MODEL [cite: 2026-01-05]
const Order = mongoose.model('Order', new mongoose.Schema({
    customerName: String,
    email: String,
    pincode: String,
    city: String,
    address: String,
    landmark: { type: String, default: "N/A" }, 
    items: Array,
    total: Number,
    status: { type: String, default: "Pending" },
    date: { type: Date, default: Date.now }
}));

// 3. API ROUTES
app.get('/api/products', async (req, res) => {
    try {
        const items = await Product.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Error fetching products" });
    }
});

// THIS ROUTE FIXES THE "CANNOT POST" ERROR
app.post('/api/orders', async (req, res) => {
    console.log("ORDER BODY:", req.body); // 👈 ADD THIS LINE
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ success: true, message: "Order stored" });
    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================= ADMIN ORDERS VIEW =================
const ADMIN_KEY = process.env.ADMIN_KEY || "essentix-secret";

app.get('/api/admin/orders', async (req, res) => {
    if (req.headers['x-admin-key'] !== ADMIN_KEY) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= UPDATE ORDER STATUS =================
app.put('/api/admin/order-status/:id', async (req, res) => {
    if (req.headers['x-admin-key'] !== ADMIN_KEY) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
