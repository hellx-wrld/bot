const Bank = require('../database/bankModel');
const Log = require('../database/logModel');

module.exports = {
  name: 'interest',
  description: 'Klaim bunga harian dari saldo bank',
  async execute(interaction) {
    let bank = await Bank.findOne({ userId: interaction.user.id });
    if (!bank) bank = await Bank.create({ userId: interaction.user.id });
    const now = Date.now();
    if (now - (bank.lastInterest || 0) < 86400000)
      return interaction.reply('Bunga hanya bisa diklaim 1x sehari!');
    const interest = Math.floor(bank.balance * 0.02); // 2% bunga
    if (interest <= 0)
      return interaction.reply(
        'Saldo bank kamu belum cukup untuk dapat bunga.'
      );
    bank.balance += interest;
    bank.lastInterest = now;
    await bank.save();
    await Log.create({
      userId: interaction.user.id,
      type: 'interest',
      amount: interest,
    });
    interaction.reply(`Kamu dapat bunga ${interest} FC dari bank!`);
  },
};
