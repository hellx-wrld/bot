const userDb = require('../database/user');

module.exports = {
  name: 'balance',
  description: 'Cek saldo kamu',
  async execute(interaction, client) {
    const user = await userDb.getUser(interaction.user.id);
    const t = interaction.t || {
      balance: 'Saldo kamu: {balance} koin (contoh)',
    };
    const format =
      interaction.format ||
      ((str, vars) => str.replace('{balance}', vars.balance));
    await interaction.reply(format(t.balance, { balance: user.balance }));
  },
};
