module.exports = async (client, message) => {
  if (message.author.bot) return;
  if (message.command) {
    // assume it's a command
    if (client.global.has("log-channel") && client.channels.resolve(client.global.get("log-channel")) ) {
      let channel = await client.channels.fetch(client.global.get("log-channel"));
      channel.send(`[${new Date()}] ${message.author.tag} ran the ${message.command.name} in #${message.channel.name}: ${message.cleanContent}`);
    } else {
      console.log(
        `${message.author.tag} ran the ${message.command.name} in ${message.channel ? "#" + message.channel.name : "DMs"}: ${message.cleanContent}`
          .split("\n")
          .map(row => `  [CMD] ${row}`)
          .join("\n")
      );
    }
  } else {
    if (message.guild)
      message.member.points.award();
  }
}