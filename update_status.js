const db = require('./config/db');

// Update status column to include 'confirmed'
const updateStatusQuery = `
  ALTER TABLE orders 
  MODIFY COLUMN status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') 
  DEFAULT 'pending'
`;

db.query(updateStatusQuery, (err) => {
  if (err) {
    console.error('Error updating status column:', err.message);
  } else {
    console.log('Status column updated successfully');
  }
  
  // Verify the update
  db.query('DESCRIBE orders', (err2, results) => {
    if (err2) {
      console.error('Error describing table:', err2.message);
    } else {
      console.log('Updated orders table structure:');
      console.table(results);
    }
    process.exit();
  });
});
