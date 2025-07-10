const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
} = require('discord.js');
const fs = require('fs');
const config = require('./config');
const log = require('./utils/logger');
const path = require('path');
const connectMongo = require('./database/mongo');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.commands = new Collection();

// Load commands
const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands'))
  .filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Load events
const eventFiles = fs
  .readdirSync(path.join(__dirname, 'events'))
  .filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Prefix command handler
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  // Leveling system: tambah XP setiap chat (bisa diatur lebih spesifik)
  try {
    const Level = require('./database/levelModel');
    let level = await Level.findOne({ userId: message.author.id });
    if (!level) level = await Level.create({ userId: message.author.id });
    level.xp += 10;
    // Level up jika XP cukup (misal: 100 XP per level)
    if (level.xp >= level.level * 100) {
      level.xp = 0;
      level.level += 1;
      message.reply(`Selamat! Kamu naik ke level ${level.level}!`);
    }
    await level.save();
  } catch (err) {
    log(`ERROR leveling: ${err}`);
  }
  // Custom prefix per server
  let prefix = config.prefix;
  if (message.guild) {
    try {
      const Guild = require('./database/guildModel');
      const guildConfig = await Guild.findOne({ guildId: message.guild.id });
      if (guildConfig && guildConfig.prefix) prefix = guildConfig.prefix;
    } catch (e) {
      /* abaikan error */
    }
  }
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;
  try {
    await command.execute(
      {
        user: message.author,
        reply: (msg) => message.reply(msg),
        options: {
          getUser: (name) => message.mentions.users.first(),
          getInteger: (name) => parseInt(args[1]),
        },
        content: message.content,
        message,
        args,
      },
      client
    );
  } catch (err) {
    log(`ERROR prefix command: ${err}`);
    message.reply('Terjadi error saat menjalankan command.');
  }
});

// Slash command registration (otomatis saat start)
const slashCommands = require('./slashCommands');
const rest = new REST({ version: '10' }).setToken(config.token);
client.once('ready', async () => {
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: slashCommands.map((cmd) => cmd.toJSON()),
    });
    log('Slash commands registered.');
  } catch (error) {
    log(`ERROR register slash: ${error}`);
  }
});

// Connect to MongoDB and then login
(async () => {
  await connectMongo();
  client.login(config.token);
})();

if (process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}
