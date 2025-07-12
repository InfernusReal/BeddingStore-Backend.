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
    user_session,
    items 
  } = req.body;

  db.query(
    `INSERT INTO orders (buyer_name, buyer_email, buyer_phone, buyer_address, payment_method, payment_id, total_amount, status, user_session, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [buyer_name, buyer_email, buyer_phone, buyer_address, payment_method, payment_id, total_amount, status, user_session],
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

    // ONLY send confirmation email for admin confirmation (EasyPaisa payments)
    // This prevents duplicate emails since COD orders should not trigger this endpoint
    console.log('📧 Admin confirmed EasyPaisa payment for order:', orderId, '- sending email...');
    const axios = require('axios');
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.BACKEND_URL || 'https://bns-backend-50d4b78b5740.herokuapp.com'
      : 'http://localhost:5000';
    await axios.post(`${baseUrl}/api/send-order-confirmation`, { orderId });
    
    res.json({ message: 'Payment confirmed and email sent successfully' });
  } catch (error) {
    console.error('Error confirming payment:', error);
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete order (only if it belongs to the user session)
exports.deleteOrder = (req, res) => {
  const orderId = req.params.orderId;
  const userSession = req.headers['user-session']; // Get user session from headers

  if (!userSession) {
    return res.status(400).json({ error: 'User session required' });
  }

  // First check if the order belongs to this user session
  db.query(
    'SELECT user_session FROM orders WHERE id = ?',
    [orderId],
    (err, results) => {
      if (err) {
        console.error('Error checking order ownership:', err);
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (results[0].user_session !== userSession) {
        return res.status(403).json({ error: 'Unauthorized to delete this order' });
      }

      // Delete order items first
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

              res.json({ message: 'Order deleted successfully' });
            }
          );
        }
      );
    }
  );
};

// Update cart items from temp to pending status
exports.confirmCartCheckout = (req, res) => {
  const { userSession } = req.body;
  
  console.log('🛒 BACKEND: Confirming cart checkout for session:', userSession);
  
  if (!userSession) {
    return res.status(400).json({ error: 'User session required' });
  }
  
  db.query(
    'UPDATE orders SET status = ? WHERE user_session = ? AND status = ?',
    ['confirmed', userSession, 'temp'],
    (err, result) => {
      if (err) {
        console.error('🛒 BACKEND: Error updating cart status:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log('🛒 BACKEND: Updated', result.affectedRows, 'cart items to confirmed');
      
      res.json({ 
        message: 'Cart checkout confirmed successfully',
        ordersUpdated: result.affectedRows
      });
    }
  );
};

// Get orders for a specific user session (privacy protection)
exports.getUserOrders = (req, res) => {
  const { userSession } = req.params;
  
  if (!userSession) {
    return res.status(400).json({ error: 'User session required' });
  }
  
  db.query(
    `SELECT o.*, oi.product_id, oi.product_name, oi.product_slug, oi.quantity, oi.price, oi.subtotal
     FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.user_session = ?
     ORDER BY o.created_at DESC`,
    [userSession],
    (err, results) => {
      if (err) {
        console.error('Error fetching user orders:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
};
