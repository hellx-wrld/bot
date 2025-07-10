const Log = require('../database/logModel');

module.exports = {
  name: 'history',
  description: 'Lihat riwayat transaksi FC kamu',
  async execute(interaction) {
    const logs = await Log.find({ userId: interaction.user.id })
      .sort({ timestamp: -1 })
      .limit(10);
    if (!logs.length) return interaction.reply('Belum ada riwayat transaksi.');
    let msg = '**Riwayat transaksi terakhir:**\n';
    logs.forEach((log) => {
      msg += `- [${log.type}] ${log.amount || ''} ${log.detail || ''}\n`;
    });
    interaction.reply(msg);
  },
};
