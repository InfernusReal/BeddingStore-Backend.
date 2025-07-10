const mysql = require('mysql2');

// Load environment variables
require('dotenv').config();

// Always use individual environment variables for better control
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'F4D1BD8Bs@1234',
  database: process.env.DB_NAME || 'bns_store',
  port: parseInt(process.env.DB_PORT) || 3306,
  connectTimeout: 30000
};

console.log('Database configuration:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  passwordSet: !!dbConfig.password,
  sslEnabled: !!dbConfig.ssl
});

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error('MySQL Connection Failed:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('Error fatal:', err.fatal);
    console.error('Full error:', JSON.stringify(err, null, 2));
  } else {
    console.log('Connected to MySQL ✅');
    console.log('Connection established successfully');
  }
});

module.exports = db;
