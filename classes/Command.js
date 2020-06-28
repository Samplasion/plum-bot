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
          { name: "Message", value: error.msg.cleanContent },
          { name: "Author", value: error.msg.author.tag },
        );
      this.client.channels.cache.get("689149132375457886").send(embed);
    }
	}
}