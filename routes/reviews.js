const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');

router.post('/', reviewsController.createReview);
router.get('/product/:productSlug', reviewsController.getReviewsByProduct);

module.exports = router;
