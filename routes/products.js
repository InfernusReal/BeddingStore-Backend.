const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { upload } = require('../middleware/cloudinary');

router.get('/', productsController.getAllProducts);
router.get('/popular', productsController.getPopularProducts);
router.get('/slug/:slug', productsController.getProductBySlug);
router.get('/:slug', productsController.getProductBySlug);
router.post('/', upload.single('image'), productsController.createProduct);
router.put('/slug/:slug', upload.single('image'), productsController.updateProductBySlug);
router.delete('/:id', productsController.deleteProduct);


module.exports = router;
