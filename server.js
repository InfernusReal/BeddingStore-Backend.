const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const emailRoutes = require('./routes/email');
const adminAuthRoutes = require('./routes/admin-auth');
const uploadRoutes = require('./routes/upload');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
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
app.use('/api', require('./routes/contact')); // Contact form routes
app.use('/api', uploadRoutes); // Upload routes for Cloudinary

app.use('/api', emailRoutes);
app.use('/api/reviews', require('./routes/reviews'));


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
