const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const sanitizedOriginalName = file.originalname
      .replace(/\s+/g, '-')           // replace spaces with dashes
      .replace(/[^a-zA-Z0-9.\-_]/g, ''); // remove anything not safe for URLs
    cb(null, `${timestamp}-${sanitizedOriginalName}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb('Error: Only images allowed!');
  }
});

module.exports = upload;