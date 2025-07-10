const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Default password
const DEFAULT_PASSWORD = 'BnSxyz1234@';

async function resetAdminPassword() {
  try {
    console.log('🔄 Resetting admin password...');
    
    // Hash the default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    
    // Create new admin data
    const adminData = {
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastPasswordChange: new Date().toISOString()
    };
    
    // Write to admin data file
    const dataDir = path.join(__dirname, 'data');
    const adminDataPath = path.join(dataDir, 'admin-data.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(adminDataPath, JSON.stringify(adminData, null, 2));
    
    console.log('✅ Admin password has been reset successfully!');
    console.log('🔑 Default password: ' + DEFAULT_PASSWORD);
    console.log('📍 You can now login with this password');
    console.log('💡 Remember to change it again from Admin Settings after login');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  }
}

// Run the reset
resetAdminPassword();
