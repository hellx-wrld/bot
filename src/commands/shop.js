const Item = require('../database/itemModel');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'shop',
  description: 'Lihat daftar item yang bisa dibeli',
  async execute(interaction) {
    let lang = 'id';
    if (interaction.guildId) {
      const guild = await Guild.findOne({ guildId: interaction.guildId });
      if (guild && guild.lang) lang = guild.lang;
    }
    const t = getBotLocale(lang);
    const items = await Item.find({});
    if (!items.length) return interaction.reply(t.shop_empty || 'Shop kosong.');
    let msg = `**${t.shop_title || 'Shop Flippy Coin (FC):'}**\n`;
    items.forEach((item, i) => {
      msg += `#${i + 1} **${item.name}** - ${item.price} FC\n${item.description}\n`;
    });
    interaction.reply(msg);
  },
};
