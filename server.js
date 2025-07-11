const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const emailRoutes = require('./routes/email');
const adminAuthRoutes = require('./routes/admin-auth');
const uploadRoutes = require('./routes/upload');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Debug: Log environment variables (remove in production)
console.log('🔧 Environment Check:');
console.log('PORT:', process.env.PORT || '5000');
console.log('DB_HOST:', process.env.DB_HOST ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration for production and development
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://bedding-store-frontend.vercel.app',
    // Add your custom domain here when ready
    // 'https://yourdomain.com',
    // 'https://www.yourdomain.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Add this line to support form data
app.use('/uploads', (req, res, next) => {
  console.log('Image requested:', req.url);
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve announcement images at /images/announcements route to avoid conflict with API
app.use('/images/announcements', express.static(path.join(__dirname, 'uploads/announcements')));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/profits', require('./routes/profits')); // Admin profits/finance routes
app.use('/api/admin', adminAuthRoutes); // Admin authentication routes
app.use('/api/announcements', require('./routes/announcements')); // New announcement routes
app.use('/api/debug', require('./routes/debug')); // Debug routes - REMOVE IN PRODUCTION
app.use('/api', require('./routes/contact')); // Contact form routes
app.use('/api', uploadRoutes); // Upload routes for Cloudinary

app.use('/api', emailRoutes);
app.use('/api/reviews', require('./routes/reviews'));

// Health check route for Heroku
app.get('/', (req, res) => {
  res.json({ 
    message: 'BnS Backend API is running!', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API status route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'BnS API',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: Visit your app URL to test`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});
