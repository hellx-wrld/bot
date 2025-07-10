const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Daftar dan export semua slash command
const commands = [];
const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands'))
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.name && command.description) {
    commands.push(
      new SlashCommandBuilder()
        .setName(command.name)
        .setDescription(command.description)
      // Tambahkan opsi sesuai kebutuhan command
    );
  }
}

module.exports = commands;
