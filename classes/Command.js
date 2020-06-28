const { Command } = require('discord.js-commando');
const CommandError = require("./CommandError");
const Embed = require("./Embed");

module.exports = class PlumCommand extends Command {
  constructor(client, options) {
    super(client, options)
    
    this.permLevel = options.permLevel || 1
  }
  
  hasPermission(msg) {
    return (msg.guild ? this.client.permissions(msg.member).level : this.client.isOwner(msg.author ? 10 : 1)) >= this.permLevel
  }
  
  get [Symbol.toStringTag]() {
    return "Command"
  }
  
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
          { name: "Message", value: error.msg.content, inline: true },
          { name: "Author", value: error.msg.author.tag, inline: true },
          { name: "Error ID", value: error.msg.id },
        );
      this.client.channels.cache.get("689149132375457886").send(embed);
    }
    console.error(error.ogError);
    this.client.utils.sendErrMsg(message, `There was an error. The developers have already received the report, though you can speed the `
                         + `fix if you send them this Error ID: \`${error.msg.id}\``);
	}
}