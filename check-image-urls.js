const db = require('./config/db');

// Script to check what image URLs are in the database
async function checkImageUrls() {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, name, image_url FROM products LIMIT 10', (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        reject(err);
        return;
      }
      
      console.log('📊 Current image URLs in database:');
      console.log('=====================================');
      
      results.forEach(product => {
        console.log(`ID: ${product.id}`);
        console.log(`Name: ${product.name}`);
        console.log(`Image URL: ${product.image_url}`);
        console.log(`Type: ${product.image_url?.startsWith('http') ? 'Cloudinary/External' : 'Local Path'}`);
        console.log('---');
      });
      
      resolve(results);
    });
  });
}

// Run the check
checkImageUrls()
  .then(() => {
    console.log('✅ Check completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
