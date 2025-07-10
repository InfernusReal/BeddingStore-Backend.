const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/cloudinary');
const path = require('path');
const fs = require('fs');

// Get database connection
const db = require('../config/db');

// GET all announcements (for user feed)
router.get('/', (req, res) => {
  const query = `
    SELECT a.*, 
           COUNT(DISTINCT al.id) as like_count,
           COUNT(DISTINCT ac.id) as comment_count
    FROM announcements a
    LEFT JOIN announcement_likes al ON a.id = al.announcement_id
    LEFT JOIN announcement_comments ac ON a.id = ac.announcement_id
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching announcements:', err);
      return res.status(500).json({ message: 'Failed to fetch announcements' });
    }
    res.json(results);
  });
});

// POST new announcement (admin only)
router.post('/', upload.single('image'), (req, res) => {
  const { description } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ message: 'Image is required' });
  }
  
  if (!description) {
    return res.status(400).json({ message: 'Description is required' });
  }

  const imagePath = req.file.path; // Cloudinary URL
  
  const query = `
    INSERT INTO announcements (image_path, description, created_at)
    VALUES (?, ?, NOW())
  `;
  
  db.query(query, [imagePath, description], (err, result) => {
    if (err) {
      console.error('Error creating announcement:', err);
      return res.status(500).json({ message: 'Failed to create announcement' });
    }
    
    res.status(201).json({
      id: result.insertId,
      image_path: imagePath,
      description: description,
      created_at: new Date(),
      like_count: 0,
      comment_count: 0
    });
  });
});

// DELETE announcement (admin only)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // First get the image path to delete the file
  db.query('SELECT image_path FROM announcements WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching announcement:', err);
      return res.status(500).json({ message: 'Failed to delete announcement' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    const imagePath = results[0].image_path;
    
    // Delete from database
    db.query('DELETE FROM announcements WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error deleting announcement:', err);
        return res.status(500).json({ message: 'Failed to delete announcement' });
      }
      
      // Delete image file
      if (imagePath) {
        const fullImagePath = path.join(__dirname, '../uploads/announcements', path.basename(imagePath));
        fs.unlink(fullImagePath, (err) => {
          if (err) console.error('Error deleting image file:', err);
        });
      }
      
      res.json({ message: 'Announcement deleted successfully' });
    });
  });
});

// POST like/unlike announcement
router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  const userIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  
  // Check if user already liked this announcement
  const checkQuery = 'SELECT id FROM announcement_likes WHERE announcement_id = ? AND user_ip = ?';
  
  db.query(checkQuery, [id, userIp], (err, results) => {
    if (err) {
      console.error('Error checking like status:', err);
      return res.status(500).json({ message: 'Failed to process like' });
    }
    
    if (results.length > 0) {
      // Unlike - remove the like
      db.query('DELETE FROM announcement_likes WHERE announcement_id = ? AND user_ip = ?', [id, userIp], (err) => {
        if (err) {
          console.error('Error removing like:', err);
          return res.status(500).json({ message: 'Failed to unlike' });
        }
        res.json({ liked: false, message: 'Announcement unliked' });
      });
    } else {
      // Like - add the like
      db.query('INSERT INTO announcement_likes (announcement_id, user_ip, created_at) VALUES (?, ?, NOW())', 
        [id, userIp], (err) => {
        if (err) {
          console.error('Error adding like:', err);
          return res.status(500).json({ message: 'Failed to like' });
        }
        res.json({ liked: true, message: 'Announcement liked' });
      });
    }
  });
});

// GET like status for a specific announcement
router.get('/:id/like-status', (req, res) => {
  const { id } = req.params;
  const userIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  
  const query = 'SELECT id FROM announcement_likes WHERE announcement_id = ? AND user_ip = ?';
  
  db.query(query, [id, userIp], (err, results) => {
    if (err) {
      console.error('Error checking like status:', err);
      return res.status(500).json({ message: 'Failed to check like status' });
    }
    
    res.json({ liked: results.length > 0 });
  });
});

// GET comments for an announcement
router.get('/:id/comments', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT * FROM announcement_comments 
    WHERE announcement_id = ? 
    ORDER BY created_at ASC
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ message: 'Failed to fetch comments' });
    }
    res.json(results);
  });
});

// POST comment on announcement
router.post('/:id/comments', (req, res) => {
  const { id } = req.params;
  const { username, comment } = req.body;
  const userIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  
  if (!username || !comment) {
    return res.status(400).json({ message: 'Username and comment are required' });
  }
  
  const query = `
    INSERT INTO announcement_comments (announcement_id, username, comment, user_ip, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;
  
  db.query(query, [id, username, comment, userIp], (err, result) => {
    if (err) {
      console.error('Error creating comment:', err);
      return res.status(500).json({ message: 'Failed to create comment' });
    }
    
    res.status(201).json({
      id: result.insertId,
      announcement_id: id,
      username,
      comment,
      user_ip: userIp,
      created_at: new Date()
    });
  });
});

module.exports = router;
