const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'F4D1BD8Bs@1234',
  database: 'bns_store',
  port: 3001
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL ✅');
  
  // Fix image paths - remove /images/announcements/ prefix
  const updateQuery = `
    UPDATE announcements 
    SET image_path = REPLACE(image_path, '/images/announcements/', '')
    WHERE image_path LIKE '/images/announcements/%'
  `;
  
  db.query(updateQuery, (err, result) => {
    if (err) {
      console.error('Error updating image paths:', err);
      process.exit(1);
    }
    
    console.log(`✅ Updated ${result.affectedRows} announcement image paths`);
    
    // Verify the changes
    const selectQuery = 'SELECT id, image_path, description FROM announcements ORDER BY created_at DESC';
    
    db.query(selectQuery, (err, results) => {
      if (err) {
        console.error('Error fetching updated announcements:', err);
        process.exit(1);
      }
      
      console.log('\n📋 Current announcements:');
      results.forEach(announcement => {
        console.log(`ID: ${announcement.id}, Image: ${announcement.image_path}, Description: ${announcement.description}`);
      });
      
      db.end();
      console.log('\n✅ Database cleanup completed!');
    });
  });
});
