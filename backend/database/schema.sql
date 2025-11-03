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
