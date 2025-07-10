const userDb = require('../database/user');
const log = require('../utils/logger');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'daily',
  description: 'Klaim hadiah harian',
  async execute(interaction, client) {
    try {
      const userId = interaction.user.id;
      // Deteksi bahasa dari guild
      let lang = 'id';
      if (interaction.guildId) {
        const guild = await Guild.findOne({ guildId: interaction.guildId });
        if (guild && guild.lang) lang = guild.lang;
      }
      const t = getBotLocale(lang);
      const user = await userDb.getUser(userId);
      const now = Date.now();
      if (now - user.lastDaily < 86400000) {
        return interaction.reply({
          content:
            t.daily_already_claimed || 'Kamu sudah klaim harian hari ini!',
          ephemeral: true,
        });
      }
      const reward = Math.floor(Math.random() * 500) + 100;
      await userDb.updateBalance(userId, reward);
      await userDb.setLastDaily(userId, now);
      log(`DAILY: ${userId} dapat ${reward}`);
      interaction.reply(
        (t.daily_reward || 'Kamu dapat {reward} koin hari ini!').replace(
          '{reward}',
          reward
        )
      );
    } catch (err) {
      log(`ERROR daily: ${err}`);
      const t = getBotLocale('id');
      interaction.reply({
        content: t.daily_error || 'Terjadi error saat klaim harian.',
        ephemeral: true,
      });
    }
  },
};
