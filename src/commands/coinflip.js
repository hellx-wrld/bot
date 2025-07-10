const userDb = require('../database/user');
const Log = require('../database/logModel');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'coinflip',
  description: 'Gamble FC, pilih head/tail. Contoh: ..coinflip head 100',
  async execute(interaction) {
    let lang = 'id';
    if (interaction.guildId) {
      const guild = await Guild.findOne({ guildId: interaction.guildId });
      if (guild && guild.lang) lang = guild.lang;
    }
    const t = getBotLocale(lang);
    const args = interaction.args || [];
    const choice = args[0];
    const amount = parseInt(args[1]);
    if (!['head', 'tail'].includes(choice) || isNaN(amount) || amount <= 0) {
      return interaction.reply(
        t.coinflip_format || 'Format: ..coinflip <head/tail> <jumlah>'
      );
    }
    const user = await userDb.getUser(interaction.user.id);
    if (user.balance < amount)
      return interaction.reply(
        t.coinflip_not_enough || 'Saldo FC tidak cukup!'
      );
    const result = Math.random() < 0.5 ? 'head' : 'tail';
    let outcome = '';
    if (choice === result) {
      await userDb.updateBalance(interaction.user.id, amount);
      outcome = (t.coinflip_win || 'Kamu menang! +{amount} FC').replace(
        '{amount}',
        amount
      );
      await Log.create({
        userId: interaction.user.id,
        type: 'coinflip-win',
        amount,
      });
    } else {
      await userDb.updateBalance(interaction.user.id, -amount);
      outcome = (t.coinflip_lose || 'Kamu kalah! -{amount} FC').replace(
        '{amount}',
        amount
      );
      await Log.create({
        userId: interaction.user.id,
        type: 'coinflip-lose',
        amount: -amount,
      });
    }
    const msg = (t.coinflip_result || 'Koin: **{result}**\n{outcome}')
      .replace('{result}', result)
      .replace('{outcome}', outcome);
    interaction.reply(msg);
  },
};
