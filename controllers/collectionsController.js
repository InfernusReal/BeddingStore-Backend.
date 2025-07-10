const db = require('../config/db');

exports.getAllCollections = (req, res) => {
  db.query('SELECT * FROM collections', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.createCollection = (req, res) => {
  // Provide defaults for missing fields
  const { name, description = '', show_on_homepage = false } = req.body;
  db.query(
    'INSERT INTO collections (name, description, show_on_homepage) VALUES (?, ?, ?)',
    [name, description, show_on_homepage],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId });
    }
  );
};

exports.deleteCollection = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM collections WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Collection not found' });
    res.json({ message: 'Collection deleted successfully' });
  });
};
