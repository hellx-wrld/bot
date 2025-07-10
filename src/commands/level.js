const Level = require('../database/levelModel');

module.exports = {
  name: 'level',
  description: 'Cek XP dan level kamu',
  async execute(interaction) {
    let level = await Level.findOne({ userId: interaction.user.id });
    if (!level) level = await Level.create({ userId: interaction.user.id });
    interaction.reply(`Level: ${level.level} | XP: ${level.xp}`);
  },
};
