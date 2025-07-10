const config = require('../config');

module.exports = {
  name: 'admin',
  description: 'Command admin (hanya owner)',
  async execute(interaction, client) {
    if (interaction.user.id !== config.ownerId) {
      return interaction.reply({
        content: 'Hanya owner yang bisa pakai command ini.',
        ephemeral: true,
      });
    }
    await interaction.reply('Command admin berhasil dijalankan!');
  },
};
