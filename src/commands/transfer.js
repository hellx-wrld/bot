const userDb = require('../database/user');
const Log = require('../database/logModel');

module.exports = {
  name: 'transfer',
  description: 'Transfer koin ke user lain',
  async execute(interaction, client) {
    const t = interaction.t;
    const format = interaction.format;
    const userId = interaction.user.id;
    const mention = interaction.options.getUser
      ? interaction.options.getUser('user')
      : interaction.args && interaction.args[0]
        ? { id: interaction.args[0], username: interaction.args[1] || 'User' }
        : null;
    const amount = interaction.options?.getInteger
      ? interaction.options.getInteger('amount')
      : interaction.args && parseInt(interaction.args[1]);
    if (!mention || !amount || amount <= 0) {
      return interaction.response(t.transfer_format, { ephemeral: true });
    }
    if (mention.id === userId) {
      return interaction.response(t.transfer_self, { ephemeral: true });
    }
    const mongoose = require('mongoose');
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const user = await userDb.getUser(userId);
      if (user.balance < amount) {
        await session.abortTransaction();
        return interaction.response(t.transfer_not_enough, { ephemeral: true });
      }
      await userDb.updateBalance(userId, -amount);
      await userDb.getUser(mention.id);
      await userDb.updateBalance(mention.id, amount);
      await Log.create({
        userId,
        type: 'transfer',
        detail: `to:${mention.id}`,
        amount,
      });
      await Log.create({
        userId: mention.id,
        type: 'transfer_in',
        detail: `from:${userId}`,
        amount,
      });
      await session.commitTransaction();
      return interaction.response(
        format(t.transfer_success, { amount, user: mention.username }),
        {
          embed: {
            title: t.transfer_success,
            description: format(t.transfer_success, {
              amount,
              user: mention.username,
            }),
            color: 0x4caf50,
          },
        }
      );
    } catch (err) {
      await session.abortTransaction();
      await Log.create({
        userId,
        type: 'error',
        detail: err.message || String(err),
      });
      return interaction.response(t.transfer_error, { ephemeral: true });
    } finally {
      session.endSession();
    }
  },
};
