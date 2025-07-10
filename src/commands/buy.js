const Item = require('../database/itemModel');
const Inventory = require('../database/inventoryModel');
const userDb = require('../database/user');
const Log = require('../database/logModel');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'buy',
  description: 'Beli item dari shop. Contoh: ..buy potion',
  async execute(interaction) {
    const t = interaction.t;
    const format = interaction.format;
    const args = interaction.args || [];
    const itemName = args[0];
    if (!itemName)
      return interaction.response(t.buy_format, { ephemeral: true });
    // Atomic transaction
    const mongoose = require('mongoose');
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const item = await Item.findOne({ name: itemName }).session(session);
      if (!item) {
        await session.abortTransaction();
        return interaction.response(t.buy_not_found, { ephemeral: true });
      }
      const user = await userDb.getUser(interaction.user.id);
      if (user.balance < item.price) {
        await session.abortTransaction();
        return interaction.response(t.buy_not_enough, { ephemeral: true });
      }
      await userDb.updateBalance(interaction.user.id, -item.price);
      await Inventory.findOneAndUpdate(
        { userId: interaction.user.id, item: item.name },
        { $inc: { quantity: 1 } },
        { upsert: true, session }
      );
      await Log.create({
        userId: interaction.user.id,
        type: 'buy',
        detail: item.name,
        amount: item.price,
      });
      await session.commitTransaction();
      return interaction.response(
        format(t.buy_success, { item: item.name, price: item.price }),
        {
          embed: {
            title: t.buy_success,
            description: format(t.buy_success, {
              item: item.name,
              price: item.price,
            }),
            color: 0x4caf50,
          },
        }
      );
    } catch (err) {
      await session.abortTransaction();
      await Log.create({
        userId: interaction.user.id,
        type: 'error',
        detail: err.message || String(err),
      });
      return interaction.response('Terjadi error saat membeli item.', {
        ephemeral: true,
      });
    } finally {
      session.endSession();
    }
  },
};
