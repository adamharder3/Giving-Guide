require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Example route
// app.get('/api/charities', async (req, res) => {
//   const charities = await db.getAllCharities();
//   res.json(charities);
// });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
