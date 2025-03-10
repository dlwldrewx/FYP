require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const argon2 = require('argon2');


const authRoutes = require('./routes/authRoutes'); // Import authRoutes properly
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes'); // Import product routes
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const stripe = require('stripe')('YOUR_SECRET_KEY');
const allowedOrigins = [
  "https://fyp-frontend-ten-tau.vercel.app", // frontend url
];

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies or authentication headers
  })
);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 🟢 Define Routes After Initializing `app`
app.use('/api/users', userRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // Use product routes
app.use('/api/orders', orderRoutes);   // 🆕 Order routes
app.use('/api/cart', cartRoutes);       // 🆕 Cart routes
app.use('/api/payment', paymentRoutes); // 🆕 Payment routes
app.use('/api/recommendations', recommendationRoutes);


// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
