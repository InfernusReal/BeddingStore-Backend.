const db = require('../config/db');

exports.createOrder = (req, res) => {
  const { 
    buyer_name, 
    buyer_email, 
    buyer_phone, 
    buyer_address, 
    payment_method, 
    payment_id, 
    total_amount, 
    status = 'pending',
    items 
  } = req.body;

  db.query(
    `INSERT INTO orders (buyer_name, buyer_email, buyer_phone, buyer_address, payment_method, payment_id, total_amount, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [buyer_name, buyer_email, buyer_phone, buyer_address, payment_method, payment_id, total_amount, status],
    (err, result) => {
      if (err) {
        console.error('Error creating order:', err);
        return res.status(500).json({ error: err.message });
      }

      const orderId = result.insertId;
      
      if (items && items.length > 0) {
        const values = items.map(item => [
          orderId, 
          item.product_id, 
          item.product_name,
          item.product_slug,
          item.quantity, 
          item.price,
          item.subtotal
        ]);

        db.query(
          'INSERT INTO order_items (order_id, product_id, product_name, product_slug, quantity, price, subtotal) VALUES ?',
          [values],
          (err2) => {
            if (err2) {
              console.error('Error creating order items:', err2);
              return res.status(500).json({ error: err2.message });
            }
            res.status(201).json({ orderId, message: 'Order created successfully' });
          }
        );
      } else {
        res.status(201).json({ orderId, message: 'Order created successfully' });
      }
    }
  );
};

exports.getAllOrders = (req, res) => {
  db.query(
    `SELECT o.*, oi.product_id, oi.product_name, oi.product_slug, oi.quantity, oi.price, oi.subtotal
     FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id
     ORDER BY o.created_at DESC`,
    (err, results) => {
      if (err) {
        console.error('Error fetching orders:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
};

exports.getOrderStatus = (req, res) => {
  const { orderId } = req.params;
  
  db.query(
    'SELECT status FROM orders WHERE id = ?',
    [orderId],
    (err, results) => {
      if (err) {
        console.error('Error fetching order status:', err);
        return res.status(500).json({ error: err.message });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json({ status: results[0].status });
    }
  );
};

exports.confirmPayment = async (req, res) => {
  const { orderId } = req.params;
  
  try {
    // Update order status
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE orders SET status = ?, payment_confirmed_at = NOW() WHERE id = ?',
        ['confirmed', orderId],
        (err, result) => {
          if (err) return reject(err);
          if (result.affectedRows === 0) {
            return reject(new Error('Order not found'));
          }
          resolve(result);
        }
      );
    });

    // Send confirmation email
    const axios = require('axios');
    await axios.post('http://localhost:5000/api/send-order-confirmation', { orderId });
    
    res.json({ message: 'Payment confirmed and email sent successfully' });
  } catch (error) {
    console.error('Error confirming payment:', error);
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete order
exports.deleteOrder = (req, res) => {
  const orderId = req.params.orderId;

  // First delete order items
  db.query(
    'DELETE FROM order_items WHERE order_id = ?',
    [orderId],
    (err) => {
      if (err) {
        console.error('Error deleting order items:', err);
        return res.status(500).json({ error: err.message });
      }

      // Then delete the order
      db.query(
        'DELETE FROM orders WHERE id = ?',
        [orderId],
        (err, result) => {
          if (err) {
            console.error('Error deleting order:', err);
            return res.status(500).json({ error: err.message });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
          }

          res.json({ message: 'Order deleted successfully' });
        }
      );
    }
  );
};
