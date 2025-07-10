const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config(); // Add this to load environment variables

// Create transporter for sending emails using Highland Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_SENDER,
      pass: process.env.MAIL_PASS
    }
  });
};

// POST route for contact form submissions
router.post('/contact', async (req, res) => {
  try {
    const { name, phone, message } = req.body;

    // Validate required fields
    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields (name, phone, message) are required'
      });
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid phone number'
      });
    }

    // Validate message length
    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Message must be at least 10 characters long'
      });
    }

    // For development/testing - log the contact form data
    console.log('=== NEW CONTACT FORM SUBMISSION ===');
    console.log('Name:', name);
    console.log('Phone:', phone);
    console.log('Message:', message);
    console.log('Time:', new Date().toLocaleString());
    console.log('====================================');

    const transporter = createTransporter();

    // Email content for admin (sent to bnsorders10@gmail.com)
    const adminMailOptions = {
      from: process.env.MAIL_SENDER,
      to: process.env.CONTACT_EMAIL, // Use environment variable
      subject: `New Contact Form Submission - BnS Store`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #d4af37 0%, #f2d06b 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h2 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h2>
            <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">BnS Luxury Bedding Store</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #d4af37; margin: 0 0 15px 0; font-size: 18px;">Customer Information</h3>
              <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #333;">Name:</strong> <span style="color: #666;">${name}</span></p>
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
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">This email was sent from the BnS Store contact form</p>
          </div>
        </div>
      `
    };

    // Send email to bnsorders10@gmail.com
    await transporter.sendMail(adminMailOptions);
    console.log(`✅ Contact form email sent successfully to ${process.env.CONTACT_EMAIL}`);

    // Add debug logging
    console.log('🔍 CONTACT FORM DEBUG:');
    console.log('- CONTACT_EMAIL from env:', process.env.CONTACT_EMAIL);
    console.log('- MAIL_SENDER from env:', process.env.MAIL_SENDER);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
