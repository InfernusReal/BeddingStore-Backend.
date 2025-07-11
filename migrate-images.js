const mysql = require('mysql2');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  connectTimeout: 30000
};

async function migrateLocalImagesToCloudinary() {
  const connection = mysql.createConnection(dbConfig);
  
  try {
    console.log('🔄 Starting image migration...');
    
    // Get all products with local image paths
    const [products] = await connection.promise().query(
      'SELECT id, name, image_url FROM products WHERE image_url LIKE "/uploads/%"'
    );
    
    console.log(`📋 Found ${products.length} products with local images`);
    
    if (products.length === 0) {
      console.log('✅ No products need migration');
      return;
    }
    
    // Option 1: Clear image_url for manual re-upload
    console.log('🧹 Clearing local image paths (products will show placeholder until re-uploaded)...');
    
    await connection.promise().query(
      'UPDATE products SET image_url = NULL WHERE image_url LIKE "/uploads/%"'
    );
    
    console.log('✅ Migration complete! Products with local images now show placeholders.');
    console.log('📝 You can now re-upload images through the admin panel and they will go to Cloudinary.');
    
    // Log which products need re-uploading
    console.log('\n📋 Products that need new images:');
    products.forEach(product => {
      console.log(`- ${product.name} (ID: ${product.id})`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    connection.end();
  }
}

// Run the migration
migrateLocalImagesToCloudinary();
