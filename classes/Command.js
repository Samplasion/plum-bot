const { Command } = require('discord.js-commando');
const CommandError = require("./CommandError");
const Embed = require("./Embed");

module.exports = class PlumCommand extends Command {
  onError(err, message, args, fromPattern, result) { // eslint-disable-line no-unused-vars
		// super.onError(err, message, args, fromPattern, result);
    let error = new CommandError(err, message);
    console.log(error instanceof CommandError, error.name)
    if (error instanceof CommandError) {
      let embed = new Embed(this.client)
        .setTitle("Uncaught exception in code")
        .setColor("RED")
        .setDescription(`${"```js"}\n${error.ogError.stack}${"```"}`)
        .addFields(
          { name: "Message", value: error.msg.cleanContent, inline: true },
          { name: "Author", value: error.msg.author.tag, inline: true },
          { name: "Error ID", value: error.msg.id },
        );
      this.client.channels.cache.get("689149132375457886").send(embed);
    }
    
    message.channel.send()
	}
}