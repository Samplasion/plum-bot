module.exports = async (client, message) => {
  if (message.author.bot) return;
  
  const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
	if (message.content.match(prefixMention) && message.guild) {
    let e = client.utils.embed()
      .setTitle("Welcome to " + client.user.username + "!")
      .setDescription("I hope you'll like this new bot, which I've put hours into making as polished as it can be. Oh, and the prefix is `"+message.guild.commandPrefix+"`")
    return message.channel.send(e)
	}
  
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
    if (message.guild && !message.author.bot) {
      let lvlup = message.member.points.award();
      if (lvlup && message.guild.id != "623600255987875870" && message.guild.config.data.levelupmsgs == "true") {
        let embed = client.utils.embed()
          .setAuthor(message.member.displayName, message.author.displayAvatarURL())
          .setColor(message.member.displayHexColor)
          .setTitle("Congratulations!")
          .setDescription("You've leveled UP!")
          .addField("New Level", message.member.points.data.level)
          .setThumbnail(message.author.displayAvatarURL());
        await message.channel.send(embed)
      }
    }
  }
}