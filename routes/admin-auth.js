const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

// File paths for storing admin data
const ADMIN_DATA_FILE = path.join(__dirname, '../data/admin-data.json');
const ACCESS_LOGS_FILE = path.join(__dirname, '../data/access-logs.json');

// Ensure data directory exists
const ensureDataDirectory = async () => {
  const dataDir = path.join(__dirname, '../data');
  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Initialize admin data with default password
const initializeAdminData = async () => {
  await ensureDataDirectory();
  
  try {
    await fs.access(ADMIN_DATA_FILE);
  } catch (error) {
    // File doesn't exist, create with default password
    const defaultPassword = 'BnSxyz1234@';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    
    const adminData = {
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastPasswordChange: new Date().toISOString()
    };
    
    await fs.writeFile(ADMIN_DATA_FILE, JSON.stringify(adminData, null, 2));
    console.log('🔐 Admin data initialized with default password');
  }
};

// Initialize access logs
const initializeAccessLogs = async () => {
  await ensureDataDirectory();
  
  try {
    await fs.access(ACCESS_LOGS_FILE);
  } catch (error) {
    await fs.writeFile(ACCESS_LOGS_FILE, JSON.stringify([], null, 2));
    console.log('📊 Access logs file created');
  }
};

// Helper function to log access attempts
const logAccessAttempt = async (ip, success, userAgent = null) => {
  try {
    const logs = JSON.parse(await fs.readFile(ACCESS_LOGS_FILE, 'utf8'));
    
    // Get location info (you can enhance this with a geolocation service)
    let location = 'Unknown';
    if (ip !== '127.0.0.1' && ip !== '::1') {
      // For production, you could integrate with a geolocation API
      location = 'External';
    } else {
      location = 'Local';
    }
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip,
      location,
      success,
      userAgent: userAgent ? userAgent.substring(0, 100) : null // Truncate long user agents
    };
    
    logs.unshift(logEntry); // Add to beginning
    
    // Keep only last 100 entries
    if (logs.length > 100) {
      logs.splice(100);
    }
    
    await fs.writeFile(ACCESS_LOGS_FILE, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Error logging access attempt:', error);
  }
};

// Admin login endpoint
router.post('/login', async (req, res) => {
  const { password, ip, timestamp } = req.body;
  const userAgent = req.get('User-Agent');

  if (!password) {
    await logAccessAttempt(ip || req.ip, false, userAgent);
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    await initializeAdminData();
    
    const adminData = JSON.parse(await fs.readFile(ADMIN_DATA_FILE, 'utf8'));
    const isValidPassword = await bcrypt.compare(password, adminData.password);

    if (isValidPassword) {
      await logAccessAttempt(ip || req.ip, true, userAgent);
      res.json({ success: true, message: 'Login successful' });
    } else {
      await logAccessAttempt(ip || req.ip, false, userAgent);
      res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    await logAccessAttempt(ip || req.ip, false, userAgent);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Change password endpoint
router.post('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long' });
  }

  try {
    await initializeAdminData();
    
    const adminData = JSON.parse(await fs.readFile(ADMIN_DATA_FILE, 'utf8'));
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, adminData.password);

    if (!isValidCurrentPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update admin data
    adminData.password = hashedNewPassword;
    adminData.lastPasswordChange = new Date().toISOString();
    
    await fs.writeFile(ADMIN_DATA_FILE, JSON.stringify(adminData, null, 2));
    
    // Log password change
    await logAccessAttempt(req.ip, true, `Password changed: ${req.get('User-Agent')}`);
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

// Get access logs endpoint
router.get('/access-logs', async (req, res) => {
  try {
    await initializeAccessLogs();
    const logs = JSON.parse(await fs.readFile(ACCESS_LOGS_FILE, 'utf8'));
    res.json(logs);
  } catch (error) {
    console.error('Error fetching access logs:', error);
    res.status(500).json({ message: 'Failed to fetch access logs' });
  }
});

// Initialize data files on module load
(async () => {
  await initializeAdminData();
  await initializeAccessLogs();
})();

module.exports = router;
