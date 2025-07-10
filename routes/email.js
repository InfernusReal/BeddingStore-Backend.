const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

router.post('/send-email', async (req, res) => {
  const { name, phone, email, address, message, products, totalPrice, purpose } = req.body;

  let subject = '';
  let htmlContent = '';
  let recipient = '';

  // Debugging incoming data
  console.log('📋 EMAIL PAYLOAD DEBUG:');
  console.log('- Name:', name);
  console.log('- Client Email:', email);
  console.log('- Phone:', phone);
  console.log('- Address:', address);
  console.log('- Purpose:', purpose);
  console.log('---');
  
  // FORCE DEBUG ENVIRONMENT VARIABLES
  console.log('🔍 ENVIRONMENT VARIABLES CHECK:');
  console.log('- ORDER_EMAIL from env:', process.env.ORDER_EMAIL);
  console.log('- CONTACT_EMAIL from env:', process.env.CONTACT_EMAIL);
  console.log('- MAIL_SENDER from env:', process.env.MAIL_SENDER);
  console.log('---');

  if (purpose === 'order') {
    subject = 'New Order Received';
    recipient = process.env.ORDER_EMAIL;
    console.log('🛒 ORDER EMAIL - Recipient set to:', recipient);

    const safeProducts = Array.isArray(products) ? products : [];
    const productListHTML = safeProducts.map(p =>
      `<li>
        <a href="http://localhost:5173/product/${p.slug}" target="_blank" style="color:#2196f3;text-decoration:underline;">
          ${p.name}
        </a> - PKR ${(p.price * (p.quantity || 1)).toLocaleString()} ${(p.quantity && p.quantity > 1) ? `(${p.quantity} × PKR ${p.price.toLocaleString()})` : ''}
      </li>`
    ).join('');

    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #d4af37 0%, #f2d06b 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 24px;">🛒 New Order Received!</h2>
          <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">BnS Luxury Bedding Store</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #d4af37; margin: 0 0 15px 0; font-size: 18px;">Customer Information</h3>
            <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Name:</strong> <span style="color: #666;">${name}</span></p>
            <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Phone:</strong> <span style="color: #666;">${phone}</span></p>
            <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Email:</strong> <span style="color: #666;">${email}</span></p>
            <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Address:</strong> <span style="color: #666;">${address}</span></p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #d4af37; margin: 0 0 15px 0; font-size: 18px;">Order Details</h3>
            <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; border-left: 4px solid #d4af37;">
              <ul style="margin: 0; padding-left: 20px; color: #444;">${productListHTML || '<li>No products found</li>'}</ul>
            </div>
            <div style="margin-top: 15px; padding: 15px; background: #e8f5e8; border-radius: 5px; border-left: 4px solid #4CAF50;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #2E7D32;">
                💰 Total Amount: PKR ${totalPrice ? totalPrice.toLocaleString() : '0'}
              </p>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 8px; border-left: 4px solid #2196F3;">
            <p style="margin: 0; color: #1976D2; font-size: 14px;">
              <strong>📅 Order Received:</strong> ${new Date().toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">This order was placed through the BnS Store website</p>
        </div>
      </div>
    `;
  }
  else if (purpose === 'contact') {
    subject = 'New Contact Form Submission';
    recipient = process.env.CONTACT_EMAIL;

    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #d4af37 0%, #f2d06b 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 24px;">💬 New Contact Message</h2>
          <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">BnS Luxury Bedding Store</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #d4af37; margin: 0 0 15px 0; font-size: 18px;">Contact Information</h3>
            <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Name:</strong> <span style="color: #666;">${name}</span></p>
            <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Email:</strong> <span style="color: #666;">${email}</span></p>
            <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Phone:</strong> <span style="color: #666;">${phone}</span></p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #d4af37; margin: 0 0 15px 0; font-size: 18px;">Customer Message</h3>
            <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; border-left: 4px solid #d4af37;">
              <p style="margin: 0; line-height: 1.6; color: #444; font-size: 15px;">${message}</p>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 8px; border-left: 4px solid #2196F3;">
            <p style="margin: 0; color: #1976D2; font-size: 14px;">
              <strong>📅 Received:</strong> ${new Date().toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">This message was sent from the BnS Store contact form</p>
        </div>
      </div>
    `;
  }

  // Environment sanity checks
  if (!process.env.MAIL_SENDER || !process.env.MAIL_PASS) {
    console.error('Missing MAIL_SENDER or MAIL_PASS in environment variables');
    return res.status(500).json({ message: 'Email credentials not set in environment variables.' });
  }

  if (!recipient) {
    console.error('Recipient email is undefined. Check environment variables.');
    return res.status(500).json({ message: 'Recipient email not set in environment variables.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_SENDER,
      pass: process.env.MAIL_PASS,
    }
  });

  try {
    // Send email to admin (business owner) only
    console.log(`📧 Sending admin notification to: ${recipient}`);
    await transporter.sendMail({
      from: `"Website Notification" <${process.env.MAIL_SENDER}>`,
      to: recipient,
      subject,
      html: htmlContent
    });
    console.log(`✅ Admin email sent successfully to: ${recipient}`);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// EASYPAISA ORDER CONFIRMATION EMAIL
router.post('/send-order-confirmation', async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  try {
    const db = require('../config/db');
    
    // Get order details
    const orderQuery = `
      SELECT o.*, oi.product_name, oi.product_slug, oi.price, oi.quantity
      FROM orders o 
      LEFT JOIN order_items oi ON o.id = oi.order_id 
      WHERE o.id = ?
    `;
    
    db.query(orderQuery, [orderId], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const order = results[0];
      const items = results.map(row => ({
        name: row.product_name,
        slug: row.product_slug,
        price: row.price,
        quantity: row.quantity
      }));

      const emailData = {
        name: order.buyer_name,
        phone: order.buyer_phone,
        email: order.buyer_email,
        address: order.buyer_address,
        products: items,
        totalPrice: order.total_amount
      };

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_SENDER,
          pass: process.env.MAIL_PASS,
        }
      });

      const safeProducts = Array.isArray(emailData.products) ? emailData.products : [];
      const productListHTML = safeProducts.map(p =>
        `<li>
          <a href="http://localhost:5173/product/${p.slug}" target="_blank" style="color:#2196f3;text-decoration:underline;">
            ${p.name}
          </a> - PKR ${(p.price * p.quantity).toLocaleString()} ${p.quantity > 1 ? `(${p.quantity} × PKR ${p.price.toLocaleString()})` : ''}
        </li>`
      ).join('');

      console.log(`🔍 EASYPAISA EMAIL CHECK:`);
      console.log(`- Admin email from env: "${process.env.ORDER_EMAIL}"`);
      
      // Send notification to admin about payment confirmation only
      console.log(`📧 Sending EasyPaisa payment confirmation notification to admin: ${process.env.ORDER_EMAIL}`);
      await transporter.sendMail({
        from: `"Website Notification" <${process.env.MAIL_SENDER}>`,
        to: process.env.ORDER_EMAIL,
        subject: '✅ EasyPaisa Payment Confirmed - Order Ready to Process',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h2 style="color: white; margin: 0; font-size: 24px;">✅ Payment Confirmed!</h2>
              <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">EasyPaisa Payment Successful</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 4px solid #4CAF50;">
                <h3 style="color: #2E7D32; margin: 0 0 10px 0; font-size: 18px;">🎉 Order is Ready for Processing!</h3>
                <p style="margin: 0; color: #2E7D32; font-size: 16px;">This order has been confirmed and payment received via EasyPaisa.</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="color: #d4af37; margin: 0 0 15px 0; font-size: 18px;">Order Information</h3>
                <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Order ID:</strong> <span style="color: #666; background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace;">#${orderId}</span></p>
                <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Payment Method:</strong> <span style="color: #4CAF50; font-weight: bold;">EasyPaisa ✅</span></p>
                <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Total Amount:</strong> <span style="color: #2E7D32; font-weight: bold; font-size: 18px;">PKR ${emailData.totalPrice.toLocaleString()}</span></p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="color: #d4af37; margin: 0 0 15px 0; font-size: 18px;">Customer Details</h3>
                <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Name:</strong> <span style="color: #666;">${emailData.name}</span></p>
                <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Phone:</strong> <span style="color: #666;">${emailData.phone}</span></p>
                <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Email:</strong> <span style="color: #666;">${emailData.email}</span></p>
                <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Address:</strong> <span style="color: #666;">${emailData.address}</span></p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="color: #d4af37; margin: 0 0 15px 0; font-size: 18px;">Ordered Products</h3>
                <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; border-left: 4px solid #d4af37;">
                  <ul style="margin: 0; padding-left: 20px; color: #444;">${productListHTML || '<li>No products found</li>'}</ul>
                </div>
              </div>
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">📞 Next Steps</h3>
                <p style="margin: 0; color: #856404; font-size: 15px; line-height: 1.5;">
                  <strong>Please contact the customer directly to arrange delivery.</strong><br>
                  Payment has been confirmed and the order is ready for processing.
                </p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 8px; border-left: 4px solid #2196F3;">
                <p style="margin: 0; color: #1976D2; font-size: 14px;">
                  <strong>📅 Payment Confirmed:</strong> ${new Date().toLocaleString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            
            <div style="background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="margin: 0; font-size: 12px; opacity: 0.8;">BnS Store - Luxury Bedding Across Pakistan</p>
            </div>
          </div>
        `
      });
      console.log(`✅ Admin notification sent successfully to: ${process.env.ORDER_EMAIL}`);

      res.status(200).json({ message: 'Admin notification email sent successfully' });
    });

  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    res.status(500).json({ message: 'Failed to send order confirmation email' });
  }
});

module.exports = router;
