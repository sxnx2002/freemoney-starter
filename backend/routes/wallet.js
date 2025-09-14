const express = require('express');
const multer = require('multer');
const path = require('path');
const { runOcr } = require('../utils/ocr');
const db = require('../utils/db');
const verify = require('../middleware/verify');
const { v4: uuidv4 } = require('uuid');
const upload = multer({ dest: path.join(__dirname,'..','uploads') });
const router = express.Router();

router.get('/', verify, (req,res)=>{
  const wallet = db.getWallet(req.user.id);
  res.json(wallet || {balance:0});
});

router.post('/topup-request', verify, (req,res)=>{
  const { amount } = req.body;
  if(!amount || amount <= 0) return res.status(400).json({error:'invalid amount'});
  const rec = db.createReceipt(req.user.id, amount, null);
  res.json({ok:true, receipt:rec});
});

router.post('/upload-slip/:receiptId', verify, upload.single('file'), async (req,res)=>{
  const receiptId = req.params.receiptId;
  const filePath = req.file.path;
  // run OCR
  const ocr = await runOcr(filePath);
  // naive parse amount: find first number-like fragment
  const m = ocr.text.match(/\d+[.,]?\d*/g);
  const parsed = m ? parseFloat(m[0].replace(',','')) : null;
  const rec = db.updateReceipt(receiptId, { file_path: filePath, parsed_amount: parsed, ocr_text: ocr.text, confidence: ocr.confidence });
  // auto-approve logic
  const tolerance = 0.05; // 5%
  const reqAmt = rec.request_amount;
  const okAuto = parsed && Math.abs(parsed - reqAmt) / reqAmt <= tolerance && ocr.confidence >= 0.85;
  if(okAuto){
    // credit user
    const rate = parseFloat(process.env.POINT_RATE || '1');
    const points = Math.round(parsed * rate);
    db.changeBalance(req.user.id, parsed);
    db.addTransaction(req.user.id,'topup_auto', parsed, {receiptId});
    db.updateReceipt(receiptId, { status: 'auto_approved' , parsed_amount: parsed });
    // also add points to user table
    const u = db.getUserById(req.user.id);
    const newPoints = (u.points||0) + points;
    db.db.prepare('UPDATE users SET points = ? WHERE id = ?').run(newPoints, req.user.id);
    return res.json({status:'auto_approved', parsed, points});
  }
  // else keep pending for admin review
  res.json({status:'pending', parsed, confidence: ocr.confidence});
});

router.get('/receipts', verify, (req,res)=>{
  const rows = db.db.prepare('SELECT * FROM receipts WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(rows);
});

router.post('/redeem', verify, (req,res)=>{
  const { rewardId } = req.body;
  const reward = db.db.prepare('SELECT * FROM rewards WHERE id = ?').get(rewardId);
  if(!reward) return res.status(400).json({error:'not found'});
  const user = db.getUserById(req.user.id);
  if((user.points||0) < reward.cost_points) return res.status(400).json({error:'not enough points'});
  db.db.prepare('UPDATE users SET points = points - ? WHERE id = ?').run(reward.cost_points, req.user.id);
  const r = db.db.prepare('INSERT INTO redemptions (user_id,reward_id,status) VALUES (?,?,?)').run(req.user.id, rewardId, 'pending');
  res.json({ok:true, redemptionId: r.lastInsertRowid});
});

module.exports = router;
