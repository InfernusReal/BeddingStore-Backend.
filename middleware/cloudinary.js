const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with fallback values
// Updated to use the new cloud name "BnS-Storage"
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'BnS-Storage',
  api_key: process.env.CLOUDINARY_API_KEY || '675397964745795',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'GEfA4FB_J1t-SEXGqX-p_ZTwbus',
};

console.log('🔧 Cloudinary Configuration:', {
  cloud_name: cloudinaryConfig.cloud_name,
  api_key: cloudinaryConfig.api_key ? '✅ SET' : '❌ MISSING',
  api_secret: cloudinaryConfig.api_secret ? '✅ SET' : '❌ MISSING'
});

cloudinary.config(cloudinaryConfig);

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bns-store', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
    ]
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 File filter check:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Wrapper to handle multer errors
const uploadWithErrorHandling = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('🚨 Multer/Cloudinary Error:', {
        message: err.message,
        code: err.code,
        field: err.field,
        stack: err.stack
      });
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
      }
      
      if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({ error: 'Only image files are allowed!' });
      }
      
      return res.status(500).json({ error: 'File upload failed: ' + err.message });
    }
    
    console.log('✅ File upload successful:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'NO FILE UPLOADED');
    
    next();
  });
};

module.exports = {
  upload: { single: () => uploadWithErrorHandling },
  cloudinary
};
