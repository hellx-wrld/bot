const userDb = require('../database/user');
const Log = require('../database/logModel');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'dice',
  description: 'Tebak angka dadu (1-6) untuk menang FC. Contoh: ..dice 4 100',
  async execute(interaction) {
    let lang = 'id';
    if (interaction.guildId) {
      const guild = await Guild.findOne({ guildId: interaction.guildId });
      if (guild && guild.lang) lang = guild.lang;
    }
    const t = getBotLocale(lang);
    const args = interaction.args || [];
    const guess = parseInt(args[0]);
    const amount = parseInt(args[1]);
    if (
      isNaN(guess) ||
      guess < 1 ||
      guess > 6 ||
      isNaN(amount) ||
      amount <= 0
    ) {
      return interaction.reply(
        t.dice_format || 'Format: ..dice <angka 1-6> <jumlah>'
      );
    }
    const user = await userDb.getUser(interaction.user.id);
    if (user.balance < amount)
      return interaction.reply(t.dice_not_enough || 'Saldo FC tidak cukup!');
    const roll = Math.floor(Math.random() * 6) + 1;
    let outcome = '';
    if (guess === roll) {
      const win = amount * 5;
      await userDb.updateBalance(interaction.user.id, win);
      outcome = (t.dice_win || 'Kamu menang! +{amount} FC').replace(
        '{amount}',
        win
      );
      await Log.create({
        userId: interaction.user.id,
        type: 'dice-win',
        amount: win,
      });
    } else {
      await userDb.updateBalance(interaction.user.id, -amount);
      outcome = (t.dice_lose || 'Kamu kalah! -{amount} FC').replace(
        '{amount}',
        amount
      );
      await Log.create({
        userId: interaction.user.id,
        type: 'dice-lose',
        amount: -amount,
      });
    }
    const msg = (t.dice_result || 'Dadu: **{roll}**\n{outcome}')
      .replace('{roll}', roll)
      .replace('{outcome}', outcome);
    interaction.reply(msg);
  },
};
