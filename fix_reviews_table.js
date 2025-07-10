const mysql = require('mysql2/promise');

async function updateReviewsTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'F4D1BD8Bs@1234',
      database: 'bns_store',
      port: 3001
    });

    console.log('Connected to database successfully!');

    // Check current table structure
    console.log('Current reviews table structure:');
    const [currentStructure] = await connection.execute('DESCRIBE reviews');
    currentStructure.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type}`);
    });

    // Check if we need to modify the table
    const hasProductSlug = currentStructure.find(col => col.Field === 'product_slug');
    const hasProductId = currentStructure.find(col => col.Field === 'product_id');

    if (hasProductSlug) {
      console.log('\n✅ Table already has product_slug column!');
    } else if (hasProductId) {
      console.log('\n🔄 Converting product_id to product_slug...');
      
      // Drop the foreign key constraint if it exists
      try {
        await connection.execute('ALTER TABLE reviews DROP FOREIGN KEY reviews_ibfk_1');
        console.log('Dropped foreign key constraint');
      } catch (err) {
        console.log('No foreign key constraint to drop');
      }

      // Change product_id to product_slug
      await connection.execute('ALTER TABLE reviews CHANGE product_id product_slug VARCHAR(255) NOT NULL');
      console.log('✅ Changed product_id to product_slug');

      // Update the index
      try {
        await connection.execute('DROP INDEX product_id ON reviews');
      } catch (err) {
        console.log('No product_id index to drop');
      }
      
      await connection.execute('CREATE INDEX idx_product_slug ON reviews (product_slug)');
      console.log('✅ Created index on product_slug');
    }

    // Show final structure
    console.log('\nFinal reviews table structure:');
    const [finalStructure] = await connection.execute('DESCRIBE reviews');
    finalStructure.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n✅ Reviews table is now ready for slug-based reviews!');

  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateReviewsTable();
