// Contoh model user, ganti sesuai database yang digunakan
const User = require('./userModel');

module.exports = {
  getUser: async (userId) => {
    let user = await User.findOne({ id: userId });
    if (!user) {
      user = await User.create({ id: userId });
    }
    return user;
  },
  updateBalance: async (userId, amount) => {
    await User.updateOne({ id: userId }, { $inc: { balance: amount } });
  },
  setLastDaily: async (userId, timestamp) => {
    await User.updateOne({ id: userId }, { $set: { lastDaily: timestamp } });
  },
  setLastWork: async (userId, timestamp) => {
    await User.updateOne({ id: userId }, { $set: { lastWork: timestamp } });
  },
};
