require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DATABASE_URL || './src/data/database.sqlite3');

const app = express();

// CORS configuration - allow credentials for session cookies
app.use(cors({
  origin: 'http://localhost:3000', // Your React app URL
  credentials: true
}));

app.use(express.json());

// Serve uploaded images statically
app.use('/src/data/uploads', express.static(path.join(__dirname, 'data', 'uploads')));



app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, (process.env.UPLOADS_PATH || "./src/data/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, 'temp-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


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

  let { username, password, role, secret } = req.body;

  username = username?.trim();
  password = password?.trim();

  if (!username || !password) {
    return res.status(400).json({error: 'Username and password required'})
  }

  if (!role) {
    return res.status(400).json({error: 'User role required'})
  }

  if (role !== "charity" && role !== "user") {
    return res.status(400).json({error: 'Invalid role'})
  }

  if (role == "charity" && secret !== (process.env.CHARITY_REG_CODE || "CHARITY")) {
    return res.status(403).json({error: 'Invalid authorization for charity account'})
  }

  const hashed_pw = bcrypt.hashSync(password, 10);
  const query = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)"
  db.run(query, [username, hashed_pw, role], (err) => {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({error: 'Username already taken'})
      }
      return res.status(500).json({error: 'Internal server error'})
    }
    req.session.username = username
    req.session.role = role
    return res.status(201).json({ message: 'User registered successfully', username, role });
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
    req.session.role = user.role;
    res.json({ message: 'Login successful', username: user.username, role: user.role });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out successfully' }));
});

app.get('/api/session', (req, res) => {
  if (req.session.username) {
    res.json({ loggedIn: true, username: req.session.username, role: req.session.role });
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

app.post('/api/charities', upload.single('image'), (req, res) => {
  if (!req.session.username)
    return res.status(401).json({ error: 'Not logged in' });

  if (req.session.role !== "charity")
    return res.status(403).json({ error: 'Must be charity account' });

  const { name, tags, description, website, location } = req.body;
  const file = req.file;

  if (!name) return res.status(400).json({ error: "Charity name is required" });
  if (!tags) return res.status(400).json({ error: "Charity tags are required" });
  if (!file) return res.status(400).json({ error: "Image file is required" });

  let tagsArray = Array.from(new Set(tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)))
  const tagJSON = JSON.stringify(tagsArray);

  
  const insertQuery = 'INSERT INTO charities (name, tags, description, website, location) VALUES (?, ?, ?, ?, ?)';
  db.run(insertQuery, [name, tagJSON, description, website, location], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const id = this.lastID;
    const newFilename = `img${id}${path.extname(file.originalname)}`;
    const newPath = path.join((process.env.UPLOADS_PATH || "./src/data/uploads"), newFilename);

    fs.rename(file.path, newPath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      }

      const updateQuery = `UPDATE charities SET filename = ? WHERE id = ?`;
      db.run(updateQuery, [newFilename, id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal server error" });
        }

        return res.status(201).json({
          message: "Charity created successfully",
          id,
          name,
          tags: tagsArray,
          description,
          website,
          location,
          filename: newFilename
        });
      });
    });
  });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));