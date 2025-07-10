const ADMIN_IDS = (process.env.OWNER_ID || '').split(',');
const MOD_IDS = (process.env.MOD_IDS || '').split(',');

function getRole(userId) {
  if (ADMIN_IDS.includes(userId)) return 'admin';
  if (MOD_IDS.includes(userId)) return 'moderator';
  return 'user';
}

module.exports = getRole;
