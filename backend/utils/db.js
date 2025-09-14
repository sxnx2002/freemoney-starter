const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const dbFile = process.env.DATABASE_FILE || path.join(__dirname,'..','data','dev.db');
fs.mkdirSync(path.dirname(dbFile), { recursive: true });
const db = new Database(dbFile);

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT,
  bank_info TEXT,
  points INTEGER DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS wallets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  balance NUMERIC DEFAULT 0
);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT,
  amount NUMERIC,
  meta TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS receipts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  request_amount NUMERIC,
  file_path TEXT,
  parsed_amount NUMERIC,
  status TEXT DEFAULT 'pending',
  ocr_text TEXT,
  confidence REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  cost_points INTEGER,
  stock INTEGER DEFAULT 0,
  image TEXT
);
CREATE TABLE IF NOT EXISTS redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  reward_id INTEGER,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = {
  db,
  getUserByEmail(email){ return db.prepare('SELECT * FROM users WHERE email = ?').get(email); },
  createUser(email, password){ const res = db.prepare('INSERT INTO users (email,password) VALUES (?,?)').run(email,password); db.prepare('INSERT INTO wallets (user_id,balance) VALUES (?,0)').run(res.lastInsertRowid); return this.getUserById(res.lastInsertRowid); },
  getUserById(id){ return db.prepare('SELECT * FROM users WHERE id = ?').get(id); },
  createReceipt(userId, amount, filePath){ const r = db.prepare('INSERT INTO receipts (user_id,request_amount,file_path,status) VALUES (?,?,?,?)').run(userId,amount,filePath,'pending'); return db.prepare('SELECT * FROM receipts WHERE id = ?').get(r.lastInsertRowid); },
  updateReceipt(id, fields){ const keys = Object.keys(fields); const vals = keys.map(k=>fields[k]); const set = keys.map(k=>`${k} = ?`).join(','); db.prepare(`UPDATE receipts SET ${set} WHERE id = ?`).run(...vals, id); return db.prepare('SELECT * FROM receipts WHERE id = ?').get(id); },
  changeBalance(userId, amount){ db.prepare('UPDATE wallets SET balance = balance + ? WHERE user_id = ?').run(amount, userId); },
  getWallet(userId){ return db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId); },
  addTransaction(userId,type,amount,meta){ db.prepare('INSERT INTO transactions (user_id,type,amount,meta) VALUES (?,?,?,?)').run(userId,type,amount,JSON.stringify(meta||{})); }
};
