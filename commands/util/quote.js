const Command = require('./../../classes/Command.js');
const Embed = require("../../classes/Embed");

module.exports = class QuoteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "quote",
      group: "util",
      memberName: "quote",
      description: "Quotes a message, with a \"Jump to...\" link",
      formatExplanation: {
        "<message>": "The ID of the message to quote."
      },
      args: [
	      {
	  			key: "message",
					prompt: "which message do you wanna quote?",
					type: "message"
				}
			],
    });
  }
  
  async run(msg, { message }) {
    let text = this.client.utils.embedSplit(`${message.content}\n\n[Jump to Message](${message.url})`, "\u200b", "", true);
    let desc = text.splice(0, 1)[0].value;

    const embed = msg.makeEmbed()
        .setThumbnail(message.author.displayAvatarURL({ format: "png", dynamic: true }))
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
        .setDescription(desc)
        .setTimestamp(message.createdAt)
        .setFooter(`ID: ${message.id}`);
        
    if (text)
        embed.addFields(text);

    return msg.channel.send(embed);
  }
}