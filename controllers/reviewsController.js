const db = require('../config/db');

exports.createReview = (req, res) => {
  const { product_slug, reviewer_name, rating, comment } = req.body;

  // Validate rating is between 1 and 5
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
  }

  if (!product_slug || !reviewer_name || !comment) {
    return res.status(400).json({ error: 'Product slug, reviewer name, rating, and comment are required' });
  }

  db.query(
    'INSERT INTO reviews (product_slug, reviewer_name, rating, comment) VALUES (?, ?, ?, ?)',
    [product_slug, reviewer_name, rating, comment],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ 
        id: result.insertId,
        message: 'Review added successfully'
      });
    }
  );
};

exports.getReviewsByProduct = (req, res) => {
  const { productSlug } = req.params;

  db.query(
    'SELECT * FROM reviews WHERE product_slug = ? ORDER BY created_at DESC',
    [productSlug],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};
