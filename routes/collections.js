const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collectionsController');

router.get('/', collectionsController.getAllCollections);
router.post('/', collectionsController.createCollection);
router.delete('/:id', collectionsController.deleteCollection);

module.exports = router;
