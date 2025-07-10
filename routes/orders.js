const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

router.post('/', ordersController.createOrder);
router.get('/', ordersController.getAllOrders);
router.get('/:orderId/status', ordersController.getOrderStatus);
router.put('/:orderId/confirm', ordersController.confirmPayment);
router.delete('/:orderId', ordersController.deleteOrder);

module.exports = router;
