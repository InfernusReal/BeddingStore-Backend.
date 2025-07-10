const db = require('./config/db');

const updateQuery = `
  UPDATE announcements 
  SET image_path = REPLACE(image_path, '/announcements/', '/images/announcements/')
  WHERE image_path LIKE '/announcements/%'
`;

db.query(updateQuery, (err, result) => {
  if (err) {
    console.error('Error updating image paths:', err);
  } else {
    console.log(`Successfully updated ${result.affectedRows} records`);
    console.log('Image paths have been updated from /announcements/ to /images/announcements/');
  }
  db.end();
});
