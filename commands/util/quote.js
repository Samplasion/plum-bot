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
    const getDescFromEmbeds = embeds => {
      let a = ""
      embeds.forEach(embed => {
        a += `[EMBED] ${embed.title || "No title"}: ${embed.description || "No description"} [${this.client.utils.plural(embed.fields.length, "field")}]\n`
      })
      return a
    }
    // This should never be "Empty message"
    // except for photo uploads
    let d = message.embeds.length > 0 ? `${message.content+"\n" || "\n"}\n${getDescFromEmbeds(message.embeds)}` : (message.content+"\n" || "Empty message")
    let e = new Embed(this.client)
      // .setTitle(`Message sent by ${message.member.displayName}${message.author.bot ? ` ${this.client.emojis.get("489010226494963712")}` : ""}`)
      .setDescription(`${d}
[Jump to message](${this.client.utils.buildMessageURL(message.guild, message.channel, message)})`)
      .setAuthor(message.member.displayName, message.author.avatarURL())
    return msg.channel.send(e)
  }
}