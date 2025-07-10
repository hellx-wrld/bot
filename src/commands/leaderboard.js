const User = require('../database/userModel');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'leaderboard',
  description: 'Lihat 10 user terkaya',
  async execute(interaction) {
    let lang = 'id';
    if (interaction.guildId) {
      const guild = await Guild.findOne({ guildId: interaction.guildId });
      if (guild && guild.lang) lang = guild.lang;
    }
    const t = getBotLocale(lang);
    const users = await User.find({}).sort({ balance: -1 }).limit(10);
    if (!users.length)
      return interaction.reply(
        t.leaderboard_empty || 'Belum ada data leaderboard.'
      );
    let msg = `**${t.leaderboard_title || 'Leaderboard Top 10 Flippy Coin (FC):'}**\n`;
    users.forEach((user, i) => {
      msg += `#${i + 1} <@${user.id}>: ${user.balance} FC\n`;
    });
    interaction.reply(msg);
  },
};
