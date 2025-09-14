const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success:false, message:'Missing fields' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashed]);
    return res.json({ success:true, message:'User registered' });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ success:false, message:'Register failed' });
  }
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success:false, message:'Missing fields' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ success:false, message:'Invalid credentials' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success:false, message:'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success:true, token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ success:false, message:'Login failed' });
  }
});
module.exports = router;
