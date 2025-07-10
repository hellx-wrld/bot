const Bank = require('../database/bankModel');
const userDb = require('../database/user');
const Log = require('../database/logModel');

module.exports = {
  name: 'deposit',
  description: 'Deposit FC ke bank. Contoh: ..deposit 100',
  async execute(interaction) {
    const t = interaction.t;
    const format = interaction.format;
    const userId = interaction.user.id;
    const args = interaction.args || [];
    const amount = interaction.options?.getInteger
      ? interaction.options.getInteger('amount')
      : parseInt(args[0]);
    if (!amount || isNaN(amount) || amount <= 0)
      return interaction.response(t.deposit_format, { ephemeral: true });
    const mongoose = require('mongoose');
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const user = await userDb.getUser(userId);
      if (user.balance < amount) {
        await session.abortTransaction();
        return interaction.response(t.deposit_not_enough, { ephemeral: true });
      }
      let bank = await Bank.findOne({ userId }).session(session);
      if (!bank) bank = await Bank.create([{ userId }], { session });
      await userDb.updateBalance(userId, -amount);
      bank.balance += amount;
      await bank.save({ session });
      await Log.create({ userId, type: 'deposit', amount });
      await session.commitTransaction();
      return interaction.response(format(t.deposit_success, { amount }), {
        embed: {
          title: t.deposit_success,
          description: format(t.deposit_success, { amount }),
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
      return interaction.response('Terjadi error saat deposit.', {
        ephemeral: true,
      });
    } finally {
      session.endSession();
    }
  },
};
