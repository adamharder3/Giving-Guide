require('dotenv').config();
const express = require('express');
const cors = require('cors');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DATABASE_URL || './src/data/database.sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
