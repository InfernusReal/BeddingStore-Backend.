const express = require('express');
const router = express.Router();

// Debug endpoint to check environment variables
router.get('/env-check', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DB_HOST: process.env.DB_HOST ? '✅ SET' : '❌ MISSING',
    DB_USER: process.env.DB_USER ? '✅ SET' : '❌ MISSING',
    DB_PASSWORD: process.env.DB_PASSWORD ? '✅ SET' : '❌ MISSING',
    DB_NAME: process.env.DB_NAME ? '✅ SET' : '❌ MISSING',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ MISSING',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ MISSING',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ MISSING',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
