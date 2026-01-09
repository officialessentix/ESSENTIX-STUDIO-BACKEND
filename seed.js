const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/product');

mongoose.connect(process.env.MONGO_URI);

const archiveItems = [
    // --- 10 SHIRTS ---
    { name: "ESSENTIX OXFORD SHIRT", price: 2499, category: "shirt", image: "https://via.placeholder.com/300?text=Shirt+1" },
    { name: "ESSENTIX LINEN SHIRT", price: 2199, category: "shirt", image: "https://via.placeholder.com/300?text=Shirt+2" },
    { name: "ESSENTIX DENIM SHIRT", price: 2899, category: "shirt", image: "https://via.placeholder.com/300?text=Shirt+3" },
    { name: "ESSENTIX FLANNEL SHIRT", price: 2399, category: "shirt", image: "https://via.placeholder.com/300?text=Shirt+4" },
    { name: "ESSENTIX UTILITY SHIRT", price: 2699, category: "shirt", image: "https://via.placeholder.com/300?text=Shirt+5" },
    { name: "ESSENTIX CORDUROY SHIRT", price: 2599, category: "shirt", image: "https://via.placeholder.com/300?text=Shirt+6" },
    { name: "ESSENTIX MANDARIN SHIRT", price: 2099, category: "shirt", image: "https://via.placeholder.com/300?text=Shirt+7" },
    { name: "ESSENTIX POPLIN SHIRT", price: 2299, category: "shirt", image: "https://via.placeholder.com/300?text=Shirt+8" },
    { name: "ESSENTIX WORK SHIRT", price: 2799, category: "shirt", image: "https://via.placeholder.com/300?text=Shirt+9" },
    { name: "ESSENTIX CHAMBRAY SHIRT", price: 2499, category: "shirt", image: "https://via.placeholder.com/300?text=Shirt+10" },

    // --- 10 TEES ---
    { name: "ESSENTIX HEAVY TEE", price: 1299, category: "tee", image: "https://via.placeholder.com/300?text=Tee+1" },
    { name: "ESSENTIX BOX TEE", price: 1499, category: "tee", image: "https://via.placeholder.com/300?text=Tee+2" },
    { name: "ESSENTIX GRAPHIC TEE", price: 1599, category: "tee", image: "https://via.placeholder.com/300?text=Tee+3" },
    { name: "ESSENTIX OVERSIZED TEE", price: 1699, category: "tee", image: "https://via.placeholder.com/300?text=Tee+4" },
    { name: "ESSENTIX POCKET TEE", price: 1199, category: "tee", image: "https://via.placeholder.com/300?text=Tee+5" },
    { name: "ESSENTIX STRIPED TEE", price: 1399, category: "tee", image: "https://via.placeholder.com/300?text=Tee+6" },
    { name: "ESSENTIX LOGO TEE", price: 1299, category: "tee", image: "https://via.placeholder.com/300?text=Tee+7" },
    { name: "ESSENTIX VINTAGE TEE", price: 1799, category: "tee", image: "https://via.placeholder.com/300?text=Tee+8" },
    { name: "ESSENTIX WAFFLE TEE", price: 1499, category: "tee", image: "https://via.placeholder.com/300?text=Tee+9" },
    { name: "ESSENTIX MOCK NECK TEE", price: 1599, category: "tee", image: "https://via.placeholder.com/300?text=Tee+10" },

    // --- 10 SWEATS ---
    { name: "ESSENTIX LOGO HOODIE", price: 3499, category: "sweat", image: "https://via.placeholder.com/300?text=Sweat+1" },
    { name: "ESSENTIX ZIP SWEAT", price: 3299, category: "sweat", image: "https://via.placeholder.com/300?text=Sweat+2" },
    { name: "ESSENTIX CREWNECK", price: 2999, category: "sweat", image: "https://via.placeholder.com/300?text=Sweat+3" },
    { name: "ESSENTIX TECH HOODIE", price: 3899, category: "sweat", image: "https://via.placeholder.com/300?text=Sweat+4" },
    { name: "ESSENTIX QUARTER ZIP", price: 3599, category: "sweat", image: "https://via.placeholder.com/300?text=Sweat+5" },
    { name: "ESSENTIX FLEECE SWEAT", price: 3199, category: "sweat", image: "https://via.placeholder.com/300?text=Sweat+6" },
    { name: "ESSENTIX KNIT HOODIE", price: 4299, category: "sweat", image: "https://via.placeholder.com/300?text=Sweat+7" },
    { name: "ESSENTIX CARGO SWEATS", price: 3399, category: "sweat", image: "https://via.placeholder.com/300?text=Sweat+8" },
    { name: "ESSENTIX RAW HOODIE", price: 3699, category: "sweat", image: "https://via.placeholder.com/300?text=Sweat+9" },
    { name: "ESSENTIX PADDED SWEAT", price: 3999, category: "sweat", image: "https://via.placeholder.com/300?text=Sweat+10" }
];

const seedDB = async () => {
    try {
        await Product.deleteMany({}); // Clears existing items
        await Product.insertMany(archiveItems);
        console.log("------------------------------------");
        console.log("🔥 ARCHIVE LOADED: 30 ITEMS ADDED TO VAULT");
        console.log("------------------------------------");
        process.exit();
    } catch (err) {
        console.error("❌ SEED ERROR:", err);
        process.exit(1);
    }
};

seedDB();