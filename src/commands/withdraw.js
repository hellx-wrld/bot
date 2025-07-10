const Bank = require('../database/bankModel');
const userDb = require('../database/user');
const Log = require('../database/logModel');

module.exports = {
  name: 'withdraw',
  description: 'Tarik FC dari bank. Contoh: ..withdraw 100',
  async execute(interaction) {
    const t = interaction.t;
    const format = interaction.format;
    const userId = interaction.user.id;
    const args = interaction.args || [];
    const amount = interaction.options?.getInteger
      ? interaction.options.getInteger('amount')
      : parseInt(args[0]);
    if (!amount || isNaN(amount) || amount <= 0)
      return interaction.response(t.withdraw_format, { ephemeral: true });
    const mongoose = require('mongoose');
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      let bank = await Bank.findOne({ userId }).session(session);
      if (!bank || bank.balance < amount) {
        await session.abortTransaction();
        return interaction.response(t.withdraw_not_enough, { ephemeral: true });
      }
      await userDb.updateBalance(userId, amount);
      bank.balance -= amount;
      await bank.save({ session });
      await Log.create({ userId, type: 'withdraw', amount });
      await session.commitTransaction();
      return interaction.response(format(t.withdraw_success, { amount }), {
        embed: {
          title: t.withdraw_success,
          description: format(t.withdraw_success, { amount }),
          color: 0x4caf50,
        },
      });
    } catch (err) {
      await session.abortTransaction();
      await Log.create({
        userId,
        type: 'error',
        detail: err.message || String(err),
      });
      return interaction.response('Terjadi error saat withdraw.', {
        ephemeral: true,
      });
    } finally {
      session.endSession();
    }
  },
};
