const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const Product = require('./models/product');

const app = express();
const server = http.createServer(app);

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // You get this from Razorpay Dashboard
  key_secret: process.env.RAZORPAY_KEY_SECRET, // You get this from Razorpay Dashboard
});


// ================= MIDDLEWARE =================
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:5500", // Common for Live Server
    "https://essentix-studio-frontend.vercel.app",
    "https://essentix-backend.onrender.com" // Just in case
  ],
  methods: ["GET", "POST", "PUT"],
  allowedHeaders: ["Content-Type", "x-admin-key"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= DB CONNECTION =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: "https://essentix-studio-frontend.vercel.app",
    methods: ["GET", "POST", "PUT"]
  }
});

io.on("connection", socket => {
  console.log("🟢 Admin connected:", socket.id);
});

// ================= MODELS =================
const Order = mongoose.model("Order", new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  pincode: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  landmark: { type: String, default: "N/A" },
  items: { type: Array, required: true },
  total: { type: Number, required: true },
  paymentId: { type: String }, // <--- ADD THIS LINE
  status: { type: String, default: "Pending" },
  date: { type: Date, default: Date.now }
}));

// ================= CONSTANTS =================
const ADMIN_KEY = process.env.ADMIN_KEY;

// ================= ROUTES =================

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Essentix backend running");
});

// Get products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Place order (VALIDATION ADDED)
app.post("/api/orders", async (req, res) => {
  try {
    const { customerName, email, items, total } = req.body;

    if (!customerName || !email || !items?.length || total <= 0) {
      return res.status(400).json({
        message: "Invalid order data"
      });
    }

    const order = new Order(req.body);
    await order.save();

    io.emit("new-order", order);

    res.status(201).json({
  success: true,
  orderId: order._id,
  customerName: order.customerName,
  total: order.total
});



  } catch (err) {
    res.status(500).json({ message: "Order failed" });
  }
});


// PUBLIC Order Tracking Route
app.get("/api/orders/track/:id", async (req, res) => {
  try {
    // We look for the order by its MongoDB ID
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // We only send back what the customer needs to see (Security)
    res.json({
      status: order.status,
      customerName: order.customerName,
      date: order.date,
      total: order.total
    });
  } catch (err) {
    res.status(400).json({ message: "Invalid Order ID format" });
  }
});

// ================= PAYMENTS =================

// Create Razorpay Order
app.post("/api/payments/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    
    // Send the order details to the frontend
    res.json(razorpayOrder); 
  } catch (err) {
    console.error("Razorpay Error:", err);
    res.status(500).json({ message: "Could not create Razorpay order" });
  }
});


// Admin get orders
app.get("/api/admin/orders", async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to load orders" });
  }
});

// Update order status (VALIDATION + SOCKET)
app.put("/api/admin/order-status/:id", async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Change this in your server.js (Backend)
const allowedStatus = ["Paid & Pending", "Pending", "Shipped", "Delivered", "Cancelled"];
  if (!allowedStatus.includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    io.emit("status-updated", order);
    res.json(order);

  } catch {
    res.status(500).json({ message: "Status update failed" });
  }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
