CREATE TABLE IF NOT EXISTS charities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  tags TEXT, -- store as JSON array
  description TEXT,
  website TEXT,
  location TEXT,
  filename TEXT,
  last_updated TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  charity_id INTEGER NOT NULL,
  FOREIGN KEY (username) REFERENCES users(username),
  FOREIGN KEY (charity_id) REFERENCES charities(id)
);
