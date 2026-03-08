require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

app.use(cors()); 
app.use(express.json()); 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// GET ALL Routes
app.get('/api/routes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM routes ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET SINGLE Route
app.get('/api/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM routes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Route not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// CREATE Route
app.post('/api/routes', async (req, res) => {
  try {
    const { name, type, is_active } = req.body;
    const result = await pool.query(
      'INSERT INTO routes (name, type, is_active) VALUES ($1, $2, $3) RETURNING *',
      [name, type, is_active || true]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// UPDATE Route
app.put('/api/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, is_active } = req.body;
    
    const result = await pool.query(
      'UPDATE routes SET name = $1, type = $2, is_active = $3 WHERE id = $4 RETURNING *',
      [name, type, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Route not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE Route
app.delete('/api/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM routes WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Route not found" });
    }
    res.json({ message: "Route deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error - Check if route is attached to stops');
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));