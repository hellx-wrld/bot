const userDb = require('../../database/user');
const Log = require('../../database/logModel');

jest.mock('../../database/user');
jest.mock('../../database/logModel');

const mongoose = require('mongoose');
beforeAll(() => {
  jest.spyOn(mongoose, 'startSession').mockImplementation(() => ({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  }));
});

describe('transfer command', () => {
  let command;
  beforeEach(() => {
    command = require('../transfer');
    jest.clearAllMocks();
  });

  it('should transfer coins successfully', async () => {
    userDb.getUser.mockImplementation((id) =>
      Promise.resolve({ id, balance: id === '123' ? 1000 : 0 })
    );
    userDb.updateBalance.mockResolvedValue();
    Log.create.mockResolvedValue();
    const interaction = {
      user: { id: '123' },
      options: {
        getUser: () => ({ id: '456', username: 'TargetUser' }),
        getInteger: () => 500,
      },
      response: jest.fn(),
      t: {
        transfer_format: 'Format salah',
        transfer_self: 'Tidak bisa transfer ke diri sendiri!',
        transfer_not_enough: 'Saldo tidak cukup!',
        transfer_success: 'Transfer {amount} koin ke {user} berhasil!',
        transfer_error: 'Terjadi error saat transfer.',
      },
      format: (str, vars) =>
        str.replace('{amount}', vars.amount).replace('{user}', vars.user),
    };
    await command.execute(interaction);
    expect(interaction.response).toHaveBeenCalledWith(
      'Transfer 500 koin ke TargetUser berhasil!',
      expect.any(Object)
    );
  });

  it('should fail if not enough balance', async () => {
    userDb.getUser.mockImplementation((id) =>
      Promise.resolve({ id, balance: 100 })
    );
    const interaction = {
      user: { id: '123' },
      options: {
        getUser: () => ({ id: '456', username: 'TargetUser' }),
        getInteger: () => 500,
      },
      response: jest.fn(),
      t: {
        transfer_not_enough: 'Saldo tidak cukup!',
        transfer_format: 'Format salah',
        transfer_self: 'Tidak bisa transfer ke diri sendiri!',
        transfer_success: '',
        transfer_error: '',
      },
      format: (str, vars) => str,
    };
    await command.execute(interaction);
    expect(interaction.response).toHaveBeenCalledWith('Saldo tidak cukup!', {
      ephemeral: true,
    });
  });
});
