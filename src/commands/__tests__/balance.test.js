const userDb = require('../../database/user');

describe('balance command', () => {
  it('should return user balance', async () => {
    const fakeUser = { id: '123', balance: 1000 };
    userDb.getUser = jest.fn().mockResolvedValue(fakeUser);
    const interaction = {
      user: { id: '123' },
      reply: jest.fn(),
      t: { balance: 'Saldo kamu: {balance} koin (contoh)' },
      format: (str, vars) => str.replace('{balance}', vars.balance),
    };
    const command = require('../balance');
    await command.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(
      'Saldo kamu: 1000 koin (contoh)'
    );
  });
});
