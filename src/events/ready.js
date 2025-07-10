module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Bot siap sebagai ${client.user.tag}`);
  },
};
