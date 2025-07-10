const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/cloudinary');

// Upload single image endpoint
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image file provided' 
      });
    }

    // Return the Cloudinary URL
    res.json({ 
      imageUrl: req.file.path,
      publicId: req.file.filename 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image' 
    });
  }
});

module.exports = router;
