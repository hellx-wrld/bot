const Guild = require('../database/guildModel');
const config = require('../config');

module.exports = {
  name: 'setprefix',
  description: 'Ubah prefix bot untuk server ini (admin only)',
  async execute(interaction) {
    if (!interaction.member?.permissions?.has?.('Administrator')) {
      return interaction.reply('Hanya admin server yang bisa mengubah prefix.');
    }
    const newPrefix = interaction.args && interaction.args[0];
    if (!newPrefix || newPrefix.length > 5)
      return interaction.reply('Format: ..setprefix <prefix_baru>');
    await Guild.findOneAndUpdate(
      { guildId: interaction.message.guild.id },
      { prefix: newPrefix },
      { upsert: true }
    );
    interaction.reply(
      `Prefix bot untuk server ini diubah menjadi: \`${newPrefix}\``
    );
  },
};
