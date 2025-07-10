require('dotenv').config();

module.exports = {
  token: process.env.BOT_TOKEN,
  prefix: '..',
  ownerId: process.env.OWNER_ID || '',
  clientId: process.env.CLIENT_ID || '',
  applicationId: process.env.APPLICATION_ID || '',
  publicKey: process.env.PUBLIC_KEY || '',
};
