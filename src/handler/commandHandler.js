const Guild = require('../database/guildModel');
const getBotLocale = require('../utils/getBotLocale');
const { MessageEmbed } = require('discord.js');
const Log = require('../database/logModel');

function formatMessage(str, vars = {}) {
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

async function getLang(interaction) {
  let lang = 'id';
  if (interaction.guildId) {
    const guild = await Guild.findOne({ guildId: interaction.guildId });
    if (guild && guild.lang) lang = guild.lang;
  }
  return lang;
}

async function handleCommand(command, interaction, client) {
  try {
    const lang = await getLang(interaction);
    const t = getBotLocale(lang);
    // Helper reply: support embed, ephemeral, auto-format
    interaction.response = async (content, opts = {}) => {
      if (typeof content === 'object' && content.embed) {
        return interaction.reply({
          embeds: [content.embed],
          ephemeral: opts.ephemeral ?? false,
        });
      }
      return interaction.reply({
        content: content,
        ephemeral: opts.ephemeral ?? false,
      });
    };
    interaction.t = t;
    interaction.format = (str, vars) => formatMessage(str, vars);
    await command.execute(interaction, client);
  } catch (err) {
    await Log.create({
      userId: interaction.user?.id,
      type: 'error',
      detail: err.message || String(err),
    });
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'Terjadi error internal. Silakan coba lagi nanti.',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'Terjadi error internal. Silakan coba lagi nanti.',
        ephemeral: true,
      });
    }
  }
}

module.exports = { handleCommand, formatMessage, getLang };
