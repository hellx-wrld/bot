const fs = require('fs');
const path = require('path');

function getBotLocale(lang = 'id') {
  try {
    const file = fs.readFileSync(
      path.join(__dirname, '../locales', `${lang}.json`)
    );
    return JSON.parse(file);
  } catch {
    return {};
  }
}

module.exports = getBotLocale;
