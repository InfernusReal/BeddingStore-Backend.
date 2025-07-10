const mysql = require('mysql2/promise');

async function checkDatabase() {
  let connection;
  try {
    // Create connection with proper config
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'F4D1BD8Bs@1234',
      database: 'bns_store',
      port: 3001
    });

    console.log('Connected to database successfully!');

    // Check all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\nAvailable tables:');
    tables.forEach(table => console.log('- ' + Object.values(table)[0]));

    // Check if reviews table exists
    const reviewsTable = tables.find(t => Object.values(t)[0] === 'reviews');
    
    if (reviewsTable) {
      console.log('\n✅ Reviews table exists!');
      
      // Show table structure
      const [structure] = await connection.execute('DESCRIBE reviews');
      console.log('\nReviews table structure:');
      structure.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''}`);
      });

      // Count existing reviews
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM reviews');
      console.log(`\nExisting reviews: ${count[0].count}`);
      
    } else {
      console.log('\n❌ Reviews table does NOT exist!');
      console.log('The reviews table needs to be created.');
    }

  } catch (error) {
    console.error('Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();
