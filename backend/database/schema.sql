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
