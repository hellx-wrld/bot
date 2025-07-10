const userDb = require('../../database/user');
const Bank = require('../../database/bankModel');
const Log = require('../../database/logModel');

jest.mock('../../database/user');
jest.mock('../../database/bankModel');
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

describe('withdraw command', () => {
  let command;
  beforeEach(() => {
    command = require('../withdraw');
    jest.clearAllMocks();
  });

  it('should withdraw successfully', async () => {
    userDb.updateBalance.mockResolvedValue();
    let bankObj = {
      userId: '123',
      balance: 1000,
      save: jest.fn().mockResolvedValue(),
      session: jest.fn().mockReturnThis(),
    };
    Bank.findOne = jest
      .fn()
      .mockReturnValue({ session: () => Promise.resolve(bankObj) });
    Log.create.mockResolvedValue();
    const interaction = {
      user: { id: '123' },
      args: ['500'],
      options: undefined,
      response: jest.fn(),
      t: {
        withdraw_format: 'Format salah',
        withdraw_not_enough: 'Saldo bank tidak cukup!',
        withdraw_success: 'Berhasil tarik {amount} FC dari bank!',
      },
      format: (str, vars) => str.replace('{amount}', vars.amount),
    };
    await command.execute(interaction);
    expect(interaction.response).toHaveBeenCalledWith(
      'Berhasil tarik 500 FC dari bank!',
      expect.any(Object)
    );
  });

  it('should fail if not enough bank balance', async () => {
    let bankObj = {
      userId: '123',
      balance: 100,
      save: jest.fn().mockResolvedValue(),
      session: jest.fn().mockReturnThis(),
    };
    Bank.findOne = jest
      .fn()
      .mockReturnValue({ session: () => Promise.resolve(bankObj) });
    const interaction = {
      user: { id: '123' },
      args: ['500'],
      options: undefined,
      response: jest.fn(),
      t: {
        withdraw_not_enough: 'Saldo bank tidak cukup!',
        withdraw_format: 'Format salah',
        withdraw_success: '',
      },
      format: (str, vars) => str,
    };
    await command.execute(interaction);
    expect(interaction.response).toHaveBeenCalledWith(
      'Saldo bank tidak cukup!',
      { ephemeral: true }
    );
  });
});
