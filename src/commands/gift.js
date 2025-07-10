const Inventory = require('../database/inventoryModel');
const Log = require('../database/logModel');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'gift',
  description: 'Kirim item ke user lain. Contoh: ..gift @user potion',
  async execute(interaction) {
    let lang = 'id';
    if (interaction.guildId) {
      const guild = await Guild.findOne({ guildId: interaction.guildId });
      if (guild && guild.lang) lang = guild.lang;
    }
    const t = getBotLocale(lang);
    const mention =
      interaction.options.getUser('user') ||
      (interaction.args &&
        interaction.args[0] &&
        interaction.message.mentions.users.first());
    const itemName = interaction.args && interaction.args[1];
    if (!mention || !itemName)
      return interaction.reply(
        t.gift_format || 'Format: ..gift @user <nama_item>'
      );
    if (mention.id === interaction.user.id)
      return interaction.reply(
        t.gift_self || 'Tidak bisa gift ke diri sendiri!'
      );
    const inv = await Inventory.findOne({
      userId: interaction.user.id,
      item: itemName,
    });
    if (!inv || inv.quantity < 1)
      return interaction.reply(
        t.gift_not_found || 'Kamu tidak punya item tersebut!'
      );
    await Inventory.updateOne(
      { userId: interaction.user.id, item: itemName },
      { $inc: { quantity: -1 } }
    );
    await Inventory.findOneAndUpdate(
      { userId: mention.id, item: itemName },
      { $inc: { quantity: 1 } },
      { upsert: true }
    );
    await Log.create({
      userId: interaction.user.id,
      type: 'gift',
      detail: `${itemName} to ${mention.id}`,
    });
    interaction.reply(
      (t.gift_success || 'Berhasil mengirim **{item}** ke <@{user}>!')
        .replace('{item}', itemName)
        .replace('{user}', mention.id)
    );
  },
};
