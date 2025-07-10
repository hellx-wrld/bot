const db = require('./db');

module.exports = {
  addTransaction: (userId, type, amount) =>
    new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO transactions (userId, type, amount, timestamp) VALUES (?, ?, ?, ?)',
        [userId, type, amount, Date.now()],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    }),
  getTransactions: (userId, limit = 10) =>
    new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM transactions WHERE userId = ? ORDER BY timestamp DESC LIMIT ?',
        [userId, limit],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    }),
};
