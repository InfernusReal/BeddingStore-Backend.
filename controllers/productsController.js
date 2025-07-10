const db = require('../config/db');
const slugify = require('slugify');

exports.getAllProducts = (req, res) => {
  db.query('SELECT * FROM products WHERE published = true', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getProductBySlug = (req, res) => {
  const { slug } = req.params;
  db.query('SELECT * FROM products WHERE slug = ?', [slug], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(results[0]);
  });
};

exports.createProduct = (req, res) => {
  try {
    console.log('Incoming product POST:', {
      body: req.body,
      file: req.file
    });
    console.log("Received file:", req.file);
    const { name, description, price, published } = req.body;
    let { collection_id } = req.body;
    const slug = slugify(name, { lower: true });
    // Save image_url as Cloudinary URL
    const image_url = req.file ? req.file.path : null;

    // Convert published to integer (1 or 0)
    const publishedInt = (published === 'true' || published === true || published === 1 || published === '1') ? 1 : 0;

    // Defensive: ensure price is a valid number, else set to 0
    const priceValue = price && !isNaN(Number(price)) ? Number(price) : 0;

    // Fix: Ensure collection_id is null if not a valid integer
    if (!collection_id || collection_id === '' || isNaN(Number(collection_id))) {
      collection_id = null;
    } else {
      collection_id = Number(collection_id);
    }

    if (!image_url) {
      console.error('Image upload required');
      return res.status(400).json({ error: 'Image upload required' });
    }

    db.query(
      `INSERT INTO products (name, slug, description, price, image_url, published, collection_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description, priceValue, image_url, publishedInt, collection_id],
      (err, result) => {
        if (err) {
          console.error('DB error:', err);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Product created successfully', productId: result.insertId, image_url });
      }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected error' });
  }
};

exports.getPopularProducts = (req, res) => {
  db.query(
    `SELECT p.*, SUM(oi.quantity) AS total_ordered
     FROM products p
     JOIN order_items oi ON oi.product_id = p.id
     GROUP BY p.id
     ORDER BY total_ordered DESC
     LIMIT 4`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  });
};

exports.updateProductBySlug = (req, res) => {
  const { slug } = req.params;
  const { name, description, price, published, collection_id } = req.body;
  const image_url = req.file ? req.file.path : null; // Cloudinary URL
  // Defensive: ensure price is a valid number, else set to 0
  const priceValue = price && !isNaN(Number(price)) ? Number(price) : 0;
  const publishedInt = (published === 'true' || published === true || published === 1 || published === '1') ? 1 : 0;
  let sql = 'UPDATE products SET name=?, description=?, price=?, published=?, collection_id=?';
  let params = [name, description, priceValue, publishedInt, collection_id];
  if (image_url) {
    sql += ', image_url=?';
    params.push(image_url);
  }
  sql += ' WHERE slug=?';
  params.push(slug);
  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  });
};
