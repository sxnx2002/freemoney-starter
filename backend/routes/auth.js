const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const router = express.Router();

router.post('/register', async (req,res)=>{
  const {email,password} = req.body;
  if(!email||!password) return res.status(400).json({error:'missing'});
  const existing = db.getUserByEmail(email);
  if(existing) return res.status(400).json({error:'exists'});
  const pw = await bcrypt.hash(password, 10);
  const user = db.createUser(email,pw);
  const token = jwt.sign({id:user.id,is_admin:user.is_admin}, process.env.JWT_SECRET || 'dev', {expiresIn:'7d'});
  res.json({token, user:{id:user.id,email:user.email}});
});

router.post('/login', async (req,res)=>{
  const {email,password} = req.body;
  const user = db.getUserByEmail(email);
  if(!user) return res.status(401).json({error:'invalid'});
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(401).json({error:'invalid'});
  const token = jwt.sign({id:user.id,is_admin:user.is_admin}, process.env.JWT_SECRET || 'dev', {expiresIn:'7d'});
  res.json({token, user:{id:user.id,email:user.email}});
});

module.exports = router;
