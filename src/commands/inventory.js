const Inventory = require('../database/inventoryModel');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'inventory',
  description: 'Lihat item yang kamu miliki',
  async execute(interaction) {
    let lang = 'id';
    if (interaction.guildId) {
      const guild = await Guild.findOne({ guildId: interaction.guildId });
      if (guild && guild.lang) lang = guild.lang;
    }
    const t = getBotLocale(lang);
    const items = await Inventory.find({ userId: interaction.user.id });
    if (!items.length)
      return interaction.reply(t.inventory_empty || 'Inventaris kamu kosong.');
    let msg = `**${t.inventory_title || 'Inventaris kamu:'}**\n`;
    items.forEach((inv) => {
      msg += `- ${inv.item} x${inv.quantity}\n`;
    });
    interaction.reply(msg);
  },
};
