require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session')
const bcrypt = require('bcryptjs')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DATABASE_URL || './src/data/database.sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.get('/api/charities', (req, res) => {
  const query = "SELECT * FROM charities"
  db.all(query, [], (err, data) => {
    if (err) {
        console.log(err)
        return res.status(500).json({error: 'Internal server error'})
    }
    const charities = data.map((row) => ({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : []
    }))
  return res.json(charities)
  })
});

app.post('/api/register', (req,res) => {
  if (req.session.username) {
    return res.status(409).json({ error: "Already logged in. Please log out first" });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({error: 'Username and password required'})
  }

  const hashed_pw = bcrypt.hashSync(password, 10);
  const query = "INSERT INTO users (username, password) VALUES (?, ?)"
  db.run(query, [username, hashed_pw], (err) => {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({error: 'Username already taken'})
      }
      return res.status(500).json({error: 'Internal server error'})
    }
    req.session.username = username
    return res.status(201).json({ message: 'User registered successfully', username });
  });
})

app.post('/api/login', (req, res) => {
  if (req.session.username) {
    return res.status(409).json({ error: "Already logged in. Please log out first" });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const query = 'SELECT * FROM users WHERE username = ?'
  db.get(query, [username], (err, user) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.username = user.username;
    res.json({ message: 'Login successful', username: user.username });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out successfully' }));
});

app.post('/api/session', (req, res) => {
  if (req.session.username) {
    res.json({ loggedIn: true, username: req.session.username });
  }
  else {
    res.json({ loggedIn: false });
  }
});

app.get('/api/favorites', (req, res) => {
  if (!req.session.username)
    return res.status(401).json({ error: 'Not logged in' });

  const username = req.session.username;

  const query = "SELECT * FROM charities WHERE id IN (SELECT charity_id FROM favorites WHERE username = ?)";
  db.all(query, [username], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    const favorites = data.map(row => ({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : []
    }));
    return res.json(favorites);
  });
});

app.post('/api/favorites/:charityId', (req, res) => {
  if (!req.session.username)
    return res.status(401).json({ error: 'Not logged in' });

  const { charityId } = req.params;
  const username = req.session.username;

  // Check charity exists
  const charityQuery = 'SELECT id FROM charities WHERE id = ?';
  db.get(charityQuery, [charityId], (err, charity) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    // Check if already in favorites
    const checkQuery = 'SELECT id FROM favorites WHERE username = ? AND charity_id = ?';
    db.get(checkQuery, [username, charityId], (err, existing) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (existing) {
        return res.status(400).json({ message: 'Charity already in favorites', charityId });
      }

      // Insert favorite
      const insQuery = 'INSERT INTO favorites (username, charity_id) VALUES (?, ?)';
      db.run(insQuery, [username, charityId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Added to favorites', charityId });
      });
    });
  });
});

app.delete('/api/favorites/:charityId', (req, res) => {
  if (!req.session.username)
    return res.status(401).json({ error: 'Not logged in' });

  const { charityId } = req.params;
  const username = req.session.username;

  // Check if favorite exists
  const checkQuery = 'SELECT 1 FROM favorites WHERE username = ? AND charity_id = ?';
  db.get(checkQuery, [username, charityId], (err, existing) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!existing) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    // Delete
    const delQuery = 'DELETE FROM favorites WHERE username = ? AND charity_id = ?';
    db.run(delQuery, [username, charityId], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json({ message: 'Removed from favorites', charityId });
    });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

