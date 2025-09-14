const express = require('express');
const db = require('../utils/db');
const verify = require('../middleware/verify');
const router = express.Router();

// Quick admin auth check, assumes is_admin flag in token
router.use(verify, (req,res,next)=>{
  if(!req.user.is_admin) return res.status(403).json({error:'forbidden'});
  next();
});

router.get('/receipts/pending', (req,res)=>{
  const rows = db.db.prepare("SELECT * FROM receipts WHERE status = 'pending' ORDER BY created_at DESC").all();
  res.json(rows);
});

router.post('/receipt/:id/approve', (req,res)=>{
  const id = req.params.id;
  const rec = db.db.prepare('SELECT * FROM receipts WHERE id = ?').get(id);
  if(!rec) return res.status(404).json({error:'not found'});
  db.db.prepare('UPDATE receipts SET status = ? WHERE id = ?').run('approved', id);
  // credit user balance and points
  db.changeBalance(rec.user_id, rec.parsed_amount || rec.request_amount);
  const rate = parseFloat(process.env.POINT_RATE || '1');
  const points = Math.round((rec.parsed_amount||rec.request_amount) * rate);
  const u = db.getUserById(rec.user_id);
  db.db.prepare('UPDATE users SET points = ? WHERE id = ?').run((u.points||0)+points, rec.user_id);
  res.json({ok:true});
});

router.post('/receipt/:id/reject', (req,res)=>{
  const id = req.params.id;
  db.updateReceipt(id, { status: 'rejected' });
  res.json({ok:true});
});

router.get('/rewards', (req,res)=>{
  const rows = db.db.prepare('SELECT * FROM rewards').all();
  res.json(rows);
});

router.post('/rewards', (req,res)=>{
  const {title,description,cost,stock,image} = req.body;
  const r = db.db.prepare('INSERT INTO rewards (title,description,cost_points,stock,image) VALUES (?,?,?,?)').run(title,description,cost,stock,image);
  res.json({ok:true, id: r.lastInsertRowid});
});

module.exports = router;
