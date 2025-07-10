const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/profits - Get financial overview and all orders
router.get('/', (req, res) => {
  console.log('Profits API called');
  
  // Get total orders count
  db.query('SELECT COUNT(*) as total_orders FROM orders', (err, orderCountResult) => {
    if (err) {
      console.error('Error fetching order count:', err);
      return res.status(500).json({ error: 'Failed to fetch order count' });
    }

    const totalOrders = orderCountResult[0].total_orders;
    console.log('Total orders:', totalOrders);

    // Get total revenue
    db.query('SELECT SUM(total_amount) as total_revenue FROM orders', (err, revenueResult) => {
      if (err) {
        console.error('Error fetching revenue:', err);
        return res.status(500).json({ error: 'Failed to fetch revenue' });
      }

      const totalRevenue = revenueResult[0].total_revenue || 0;
      console.log('Total revenue:', totalRevenue);

      // Get all orders with customer details and items
      db.query(`
        SELECT 
          o.id,
          o.buyer_name as customer_name,
          o.buyer_email as customer_email,
          o.buyer_phone as customer_phone,
          o.total_amount,
          o.status,
          o.payment_method,
          o.buyer_address as delivery_address,
          o.created_at,
          oi.product_name,
          oi.quantity,
          oi.price as item_price
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        ORDER BY o.created_at DESC, oi.id ASC
      `, (err, orderResults) => {
        if (err) {
          console.error('Error fetching orders:', err);
          return res.status(500).json({ error: 'Failed to fetch orders' });
        }

        console.log('Order results fetched:', orderResults.length);

        // Group orders with their items
        const groupedOrders = orderResults.reduce((acc, row) => {
          if (!acc[row.id]) {
            acc[row.id] = {
              id: row.id,
              customer_name: row.customer_name,
              customer_email: row.customer_email,
              customer_phone: row.customer_phone,
              total_amount: row.total_amount,
              status: row.status,
              payment_method: row.payment_method,
              delivery_address: row.delivery_address,
              created_at: row.created_at,
              items: []
            };
          }
          
          if (row.product_name) {
            acc[row.id].items.push({
              product_name: row.product_name,
              quantity: row.quantity,
              item_price: row.item_price
            });
          }
          
          return acc;
        }, {});

        const orders = Object.values(groupedOrders);

        res.json({
          summary: {
            totalOrders: totalOrders,
            totalRevenue: parseFloat(totalRevenue).toFixed(2)
          },
          orders: orders
        });
      });
    });
  });
});

// DELETE /api/profits/order/:id - Delete an order and update financials
router.delete('/order/:id', (req, res) => {
  const orderId = req.params.id;
  console.log('Deleting order:', orderId);

  // First get the order to return the amount that will be deducted
  db.query('SELECT total_amount FROM orders WHERE id = ?', [orderId], (err, orderResult) => {
    if (err) {
      console.error('Error fetching order for deletion:', err);
      return res.status(500).json({ error: 'Failed to fetch order' });
    }
    
    if (orderResult.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const deletedAmount = orderResult[0].total_amount;

    // Delete the order
    db.query('DELETE FROM orders WHERE id = ?', [orderId], (err) => {
      if (err) {
        console.error('Error deleting order:', err);
        return res.status(500).json({ error: 'Failed to delete order' });
      }

      // Get updated totals
      db.query('SELECT COUNT(*) as total_orders FROM orders', (err, orderCountResult) => {
        if (err) {
          console.error('Error fetching updated order count:', err);
          return res.status(500).json({ error: 'Failed to fetch updated order count' });
        }

        const totalOrders = orderCountResult[0].total_orders;

        db.query('SELECT SUM(total_amount) as total_revenue FROM orders', (err, revenueResult) => {
          if (err) {
            console.error('Error fetching updated revenue:', err);
            return res.status(500).json({ error: 'Failed to fetch updated revenue' });
          }

          const totalRevenue = revenueResult[0].total_revenue || 0;

          res.json({
            success: true,
            message: 'Order deleted successfully',
            deletedAmount: parseFloat(deletedAmount).toFixed(2),
            updatedSummary: {
              totalOrders: totalOrders,
              totalRevenue: parseFloat(totalRevenue).toFixed(2)
            }
          });
        });
      });
    });
  });
});

module.exports = router;
