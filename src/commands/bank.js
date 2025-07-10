const Bank = require('../database/bankModel');
const userDb = require('../database/user');

module.exports = {
  name: 'bank',
  description: 'Cek saldo bank kamu',
  async execute(interaction) {
    let bank = await Bank.findOne({ userId: interaction.user.id });
    if (!bank) bank = await Bank.create({ userId: interaction.user.id });
    interaction.reply(`Saldo bank kamu: ${bank.balance} FC`);
  },
};
