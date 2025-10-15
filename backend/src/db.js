const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DATABASE_URL || './src/data/charities.db');

// Create table if missing
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS charities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    description TEXT,
    url TEXT
  )`);
});

module.exports = {
  getAllCharities: () => new Promise((resolve, reject) => {
    db.all('SELECT * FROM charities', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  })
};
