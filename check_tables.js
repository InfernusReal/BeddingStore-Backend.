const db = require('./config/db');

// Check if reviews table exists
db.query('SHOW TABLES', (err, results) => {
  if (err) {
    console.error('Error showing tables:', err);
  } else {
    console.log('Available tables:', results);
    
    // Check if reviews table exists
    const tableNames = results.map(row => Object.values(row)[0]);
    if (tableNames.includes('reviews')) {
      console.log('✅ Reviews table exists');
      
      // Check table structure
      db.query('DESCRIBE reviews', (err, structure) => {
        if (err) {
          console.error('Error describing reviews table:', err);
        } else {
          console.log('Reviews table structure:', structure);
        }
        
        // Check existing reviews
        db.query('SELECT * FROM reviews LIMIT 5', (err, reviews) => {
          if (err) {
            console.error('Error fetching reviews:', err);
          } else {
            console.log('Sample reviews:', reviews);
          }
          process.exit(0);
        });
      });
    } else {
      console.log('❌ Reviews table does not exist');
      console.log('Creating reviews table...');
      
      const createTableQuery = `
        CREATE TABLE reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_slug VARCHAR(255) NOT NULL,
          username VARCHAR(100) NOT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_product_slug (product_slug)
        )
      `;
      
      db.query(createTableQuery, (err, result) => {
        if (err) {
          console.error('Error creating reviews table:', err);
        } else {
          console.log('✅ Reviews table created successfully');
        }
        process.exit(0);
      });
    }
  }
});
