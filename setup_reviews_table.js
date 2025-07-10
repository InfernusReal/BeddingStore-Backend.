const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'F4D1BD8Bs@1234',
  database: 'bns_store',
  port: 3001
});

const createReviewsTable = `
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_slug VARCHAR(255) NOT NULL,
    reviewer_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_slug (product_slug),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);
`;

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');

  // Create reviews table
  db.query(createReviewsTable, (err, result) => {
    if (err) {
      console.error('❌ Error creating reviews table:', err);
    } else {
      console.log('✅ Reviews table created successfully');
    }
    
    db.end();
  });
});
