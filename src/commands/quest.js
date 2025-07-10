const Quest = require('../database/questModel');
const userDb = require('../database/user');
const Log = require('../database/logModel');
const getBotLocale = require('../utils/getBotLocale');
const Guild = require('../database/guildModel');

module.exports = {
  name: 'quest',
  description: 'Ambil dan klaim quest harian',
  async execute(interaction) {
    let lang = 'id';
    if (interaction.guildId) {
      const guild = await Guild.findOne({ guildId: interaction.guildId });
      if (guild && guild.lang) lang = guild.lang;
    }
    const t = getBotLocale(lang);
    // Contoh quest harian sederhana
    const userId = interaction.user.id;
    let quest = await Quest.findOne({ userId, quest: 'daily' });
    if (!quest || quest.completed) {
      // generate quest baru
      quest = await Quest.findOneAndUpdate(
        { userId, quest: 'daily' },
        { completed: false, reward: 500, timestamp: Date.now() },
        { upsert: true, new: true }
      );
      return interaction.reply(
        t.quest_new || 'Quest harian baru: Kirim 1 transfer ke user lain!'
      );
    }
    // Cek apakah quest sudah selesai (misal: sudah transfer hari ini)
    // Untuk demo, anggap quest selesai jika user pernah transfer hari ini
    const logs = await Log.find({
      userId,
      type: 'transfer',
      timestamp: { $gt: Date.now() - 86400000 },
    });
    if (logs.length > 0 && !quest.completed) {
      quest.completed = true;
      await quest.save();
      await userDb.updateBalance(userId, quest.reward);
      await Log.create({
        userId,
        type: 'quest',
        detail: 'daily',
        amount: quest.reward,
      });
      return interaction.reply(
        (
          t.quest_done || 'Quest harian selesai! Kamu dapat {reward} FC.'
        ).replace('{reward}', quest.reward)
      );
    }
    interaction.reply(
      t.quest_progress || 'Quest harian: Kirim 1 transfer ke user lain!'
    );
  },
};
