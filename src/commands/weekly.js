const userDb = require('../database/user');
const Log = require('../database/logModel');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'weekly',
  description: 'Klaim hadiah mingguan',
  async execute(interaction) {
    let lang = 'id';
    if (interaction.guildId) {
      const guild = await Guild.findOne({ guildId: interaction.guildId });
      if (guild && guild.lang) lang = guild.lang;
    }
    const t = getBotLocale(lang);
    const user = await userDb.getUser(interaction.user.id);
    const now = Date.now();
    if (now - (user.lastWeekly || 0) < 604800000)
      return interaction.reply(
        t.weekly_already_claimed || 'Kamu sudah klaim mingguan!'
      );
    const reward = Math.floor(Math.random() * 2000) + 1000;
    await userDb.updateBalance(interaction.user.id, reward);
    (await userDb.setLastWeekly)
      ? await userDb.setLastWeekly(interaction.user.id, now)
      : null;
    user.lastWeekly = now;
    await user.save();
    await Log.create({
      userId: interaction.user.id,
      type: 'weekly',
      amount: reward,
    });
    interaction.reply(
      (
        t.weekly_reward || 'Kamu dapat {reward} FC dari hadiah mingguan!'
      ).replace('{reward}', reward)
    );
  },
};
