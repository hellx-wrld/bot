const userDb = require('../database/user');
const Log = require('../database/logModel');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'lottery',
  description: 'Beli tiket lotre, undian setiap hari. Contoh: ..lottery 100',
  async execute(interaction) {
    let lang = 'id';
    if (interaction.guildId) {
      const guild = await Guild.findOne({ guildId: interaction.guildId });
      if (guild && guild.lang) lang = guild.lang;
    }
    const t = getBotLocale(lang);
    const args = interaction.args || [];
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0)
      return interaction.reply(
        t.lottery_format || 'Format: ..lottery <jumlah>'
      );
    const user = await userDb.getUser(interaction.user.id);
    if (user.balance < amount)
      return interaction.reply(t.lottery_not_enough || 'Saldo FC tidak cukup!');
    await userDb.updateBalance(interaction.user.id, -amount);
    await Log.create({
      userId: interaction.user.id,
      type: 'lottery-ticket',
      amount,
    });
    interaction.reply(
      (
        t.lottery_success ||
        'Tiket lotre seharga {amount} FC berhasil dibeli! Pengundian dilakukan setiap hari oleh admin.'
      ).replace('{amount}', amount)
    );
  },
};
