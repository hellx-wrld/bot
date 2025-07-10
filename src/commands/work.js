const userDb = require('../database/user');
const Log = require('../database/logModel');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'work',
  description: 'Kerja untuk dapat FC, cooldown 1 jam',
  async execute(interaction) {
    // Deteksi bahasa dari guild
    let lang = 'id';
    if (interaction.guildId) {
      const guild = await Guild.findOne({ guildId: interaction.guildId });
      if (guild && guild.lang) lang = guild.lang;
    }
    const t = getBotLocale(lang);
    const user = await userDb.getUser(interaction.user.id);
    const now = Date.now();
    if (now - user.lastWork < 3600000)
      return interaction.reply(
        t.work_cooldown || 'Kamu sudah kerja, coba lagi nanti!'
      );
    const reward = Math.floor(Math.random() * 200) + 50;
    await userDb.updateBalance(interaction.user.id, reward);
    await userDb.setLastWork(interaction.user.id, now);
    await Log.create({
      userId: interaction.user.id,
      type: 'work',
      amount: reward,
    });
    interaction.reply(
      (t.work_reward || 'Kamu dapat {reward} FC dari kerja!').replace(
        '{reward}',
        reward
      )
    );
  },
};
