module.exports = async (client, message) => {
  if (message.author.bot) return;
  if (message.command) {
    // assume it's a command
    if (!client.global.has("log-channel") && client.channels.cache.fetch(client.global.has("log-channel"))) {
      let channel = client.channels.cache.fetch(client.global.has("log-channel"));
      channel.send(`[${new Date()}] ${message.author.tag} ran the ${message.command.name} in #${message.channel.name}: ${message.cleanContent}`);
    }
    console.log(`[${new Date()}] ${message.author.tag} ran the ${message.command.name} in #${message.channel.name}: ${message.cleanContent}`);
  }
}