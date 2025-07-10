const fs = require('fs');
const path = require('path');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'help',
  description: 'Lihat daftar command dan deskripsi',
  async execute(interaction, client) {
    // Deteksi bahasa dari guild
    let lang = 'id';
    if (interaction.guildId) {
      const guild = await Guild.findOne({ guildId: interaction.guildId });
      if (guild && guild.lang) lang = guild.lang;
    }
    const t = getBotLocale(lang);
    const commandFiles = fs
      .readdirSync(path.join(__dirname))
      .filter((file) => file.endsWith('.js'));
    let msg = `**${t.help_title || 'Daftar Command:'}**\n`;
    for (const file of commandFiles) {
      const cmd = require(`./${file}`);
      msg += `**${cmd.name}**: ${cmd.description || '-'}\n`;
    }
    interaction.reply(msg);
  },
};
