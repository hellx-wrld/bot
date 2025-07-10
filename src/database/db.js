const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(
  path.resolve(__dirname, '../../data/economy.db')
);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    balance INTEGER DEFAULT 0,
    lastDaily INTEGER DEFAULT 0,
    lastWork INTEGER DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    type TEXT,
    amount INTEGER,
    timestamp INTEGER
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    userId TEXT,
    item TEXT,
    quantity INTEGER,
    PRIMARY KEY (userId, item)
  )`);
});

module.exports = db;
