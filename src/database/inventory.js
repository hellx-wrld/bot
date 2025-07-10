const db = require('./db');

module.exports = {
  addItem: (userId, item, quantity) =>
    new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO inventory (userId, item, quantity) VALUES (?, ?, ?) ON CONFLICT(userId, item) DO UPDATE SET quantity = quantity + ?',
        [userId, item, quantity, quantity],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    }),
  getInventory: (userId) =>
    new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM inventory WHERE userId = ?',
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    }),
};
