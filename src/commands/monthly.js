const userDb = require('../database/user');
const Log = require('../database/logModel');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'monthly',
  description: 'Klaim hadiah bulanan',
  async execute(interaction) {
    let lang = 'id';
    if (interaction.guildId) {
      const guild = await Guild.findOne({ guildId: interaction.guildId });
      if (guild && guild.lang) lang = guild.lang;
    }
    const t = getBotLocale(lang);
    const user = await userDb.getUser(interaction.user.id);
    const now = Date.now();
    if (now - (user.lastMonthly || 0) < 2592000000)
      return interaction.reply(
        t.monthly_already_claimed || 'Kamu sudah klaim bulanan!'
      );
    const reward = Math.floor(Math.random() * 5000) + 2000;
    await userDb.updateBalance(interaction.user.id, reward);
    (await userDb.setLastMonthly)
      ? await userDb.setLastMonthly(interaction.user.id, now)
      : null;
    user.lastMonthly = now;
    await user.save();
    await Log.create({
      userId: interaction.user.id,
      type: 'monthly',
      amount: reward,
    });
    interaction.reply(
      (
        t.monthly_reward || 'Kamu dapat {reward} FC dari hadiah bulanan!'
      ).replace('{reward}', reward)
    );
  },
};
