const fs = require('fs');
const path = require('path');

const logPath = path.resolve(__dirname, '../../data/bot.log');

function log(message) {
  const time = new Date().toISOString();
  fs.appendFileSync(logPath, `[${time}] ${message}\n`);
}

module.exports = log;
