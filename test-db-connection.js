const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('Testing Railway MySQL connection...');
  
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    connectTimeout: 10000
  };

  console.log('Connection config:', {
    host: config.host,
    user: config.user,
    database: config.database,
    port: config.port,
    passwordSet: !!config.password
  });

  try {
    console.log('Attempting to connect...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully!');
    
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('✅ Query executed successfully:', rows);
    
    await connection.end();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlState:', error.sqlState);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔍 Connection refused - MySQL service might not be running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔍 Access denied - Check username/password');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🔍 Host not found - Check hostname');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('🔍 Connection timeout - Check network/firewall');
    }
  }
}

testConnection();
