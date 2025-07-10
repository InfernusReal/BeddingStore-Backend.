const db = require('./config/db');

// Create announcements table
const createAnnouncementsTable = `
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_path VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

// Create announcement_likes table
const createLikesTable = `
CREATE TABLE IF NOT EXISTS announcement_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  announcement_id INT NOT NULL,
  user_ip VARCHAR(45) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_like (announcement_id, user_ip)
)`;

// Create announcement_comments table
const createCommentsTable = `
CREATE TABLE IF NOT EXISTS announcement_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  announcement_id INT NOT NULL,
  username VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL,
  user_ip VARCHAR(45) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE
)`;

// Execute the queries
db.query(createAnnouncementsTable, (err, result) => {
  if (err) {
    console.error('Error creating announcements table:', err);
  } else {
    console.log('✅ Announcements table created successfully');
  }
});

db.query(createLikesTable, (err, result) => {
  if (err) {
    console.error('Error creating likes table:', err);
  } else {
    console.log('✅ Announcement likes table created successfully');
  }
});

db.query(createCommentsTable, (err, result) => {
  if (err) {
    console.error('Error creating comments table:', err);
  } else {
    console.log('✅ Announcement comments table created successfully');
  }
});

// Close the connection after a delay
setTimeout(() => {
  db.end();
  console.log('Database setup completed!');
}, 2000);
