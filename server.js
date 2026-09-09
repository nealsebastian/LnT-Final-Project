require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { connectDB } = require('./config/db');
const seedData = require('./utils/seedData');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend demo interface
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'P01 E-Commerce Platform API is running smoothly',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404 handler
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(globalErrorHandler);

// Database connection and server initialization
const startServer = async (customPort) => {
  try {
    await connectDB();

    if (process.env.AUTO_SEED !== 'false') {
      await seedData();
    }

    const portToListen = customPort || process.env.PORT || PORT;
    const server = app.listen(portToListen, () => {
      console.log(`====================================================`);
      console.log(`🚀 P01 Enterprise E-Commerce Server running on http://localhost:${portToListen}`);
      console.log(`🌐 Live Interactive Demo UI available at http://localhost:${portToListen}`);
      console.log(`📡 REST API Endpoints active under /api/...`);
      console.log(`====================================================`);
    });

    return server;
  } catch (err) {
    console.error('Fatal Server Initialization Error:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
