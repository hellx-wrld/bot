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

describe('deposit command', () => {
  let command;
  beforeEach(() => {
    command = require('../deposit');
    jest.clearAllMocks();
  });

  it('should deposit successfully', async () => {
    userDb.getUser.mockResolvedValue({ id: '123', balance: 1000 });
    userDb.updateBalance.mockResolvedValue();
    let bankObj = {
      userId: '123',
      balance: 0,
      save: jest.fn().mockResolvedValue(),
      session: jest.fn().mockReturnThis(),
    };
    Bank.findOne = jest
      .fn()
      .mockReturnValue({ session: () => Promise.resolve(bankObj) });
    Bank.create = jest.fn().mockResolvedValue([bankObj]);
    Log.create.mockResolvedValue();
    const interaction = {
      user: { id: '123' },
      args: ['500'],
      options: undefined,
      response: jest.fn(),
      t: {
        deposit_format: 'Format salah',
        deposit_not_enough: 'Saldo FC tidak cukup!',
        deposit_success: 'Berhasil deposit {amount} FC ke bank!',
      },
      format: (str, vars) => str.replace('{amount}', vars.amount),
    };
    await command.execute(interaction);
    expect(interaction.response).toHaveBeenCalledWith(
      'Berhasil deposit 500 FC ke bank!',
      expect.any(Object)
    );
  });

  it('should fail if not enough balance', async () => {
    userDb.getUser.mockResolvedValue({ id: '123', balance: 100 });
    const interaction = {
      user: { id: '123' },
      args: ['500'],
      options: undefined,
      response: jest.fn(),
      t: {
        deposit_not_enough: 'Saldo FC tidak cukup!',
        deposit_format: 'Format salah',
        deposit_success: '',
      },
      format: (str, vars) => str,
    };
    await command.execute(interaction);
    expect(interaction.response).toHaveBeenCalledWith('Saldo FC tidak cukup!', {
      ephemeral: true,
    });
  });
});
