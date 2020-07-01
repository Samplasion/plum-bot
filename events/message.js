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
    if (message.guild) {
      let lvlup = message.member.points.award();
      if (lvlup) {
        let embed = client.utils.embed()
          .setAuthor(message.member.displayName, message.author.displayAvatarURL())
          .setColor(message.member.displayHexColor)
          .setTitle("Congratulations!")
          .setDescription("You've leveled UP!")
          .addField("New Level", message.member.points.data.level)
          .setThumbnail(message.author.displayAvatarURL());
        let msg = await message.channel.send(embed)
      }
    }
  }
}