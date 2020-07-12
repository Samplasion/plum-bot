const util = require('util');
const { MessageAttachment: Attachment } = require('discord.js');
const Command = require('./../../classes/Command.js');
const safeEval = require('safe-eval')

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'eval',
      aliases: ["ev", "js"],
			group: 'commands',
			memberName: 'eval',
			description: 'Executes JavaScript code.',
			details: 'Only the bot owner(s) may use this command.',
      permLevel: 10,
			args: [
				{
					key: 'script',
					prompt: 'What code would you like to evaluate?',
					type: 'string'
				}
			]
		});

		this.lastResult = null;
	}
  
  // hasPermission(msg) {
    // if (!this.client.isOwner(msg.author)) return 'only the bot owner(s) may use this command.';
    // return true;
  // }

	async run(message, { script }) {
		let msg = message,
      guild = msg.guild,
      user = msg.author,
      client = this.client,
      channel = msg.channel,
      chn = channel,
      cnl = channel,
      lastResult = this.lastResult,
      lr = lastResult,
      registry = client.registry,
      commands = registry.commands,
      cmds = commands;
    var code = script;
    const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
    if (script.length > 1016) code = "eval(\"Too long to be shown here\")"
    if (client.isOwner(msg.author)) {
      try {
        let evaled = eval(script);
        if (evaled instanceof Promise) evaled = await evaled;
        if (typeof evaled !== "string") evaled = util.inspect(evaled, { depth: 0 });
        const output = this.clean(evaled);
        if (output.length > 1016) {
          return message.channel.send(new Attachment(Buffer.from(output), "output.txt"));
        }
        const embed = client.utils.embed()
          .setColor(0x10ce66)
          .setDescription(`${message.author.username}, here are the results of the \`${prefix}eval\` command`)
          .setAuthor(message.author.username, message.author.avatarURL)
          .setTimestamp()
          .addField(":inbox_tray: **INPUT**", `\`\`\`js\n${code}\n\`\`\``)
          .addField(":outbox_tray: **OUTPUT**", `\`\`\`js\n${output}\n\`\`\``)
          .setFooter(`${prefix}eval`)
        this.lastResult = output;
        return message.channel.send(/*"js", output*/{ embed });
      } catch (err) {
        console.error(err)
        const errorEmbed = client.utils.embed()
          .setColor("0xE20D0D")
          .setDescription(`${message.author.username}, the \`${prefix}eval\` command returned an error`)
          .setAuthor(message.author.username, message.author.avatarURL)
          .setTimestamp()
          .addField(":inbox_tray: **INPUT**", `\`\`\`js\n${code}\n\`\`\``)
          .addField(":outbox_tray: **OUTPUT**", `\`\`\`js\n${this.clean(err)}\n\`\`\``)
          .setFooter(`${prefix}eval`)
        return message.channel.send(errorEmbed)
      }
    } else {
      try {
        let evaled = safeEval(script, {
          client: { name: this.client.user.username },
          eval: (...args) => args.join(" ")
        });
        if (evaled instanceof Promise) evaled = await evaled;
        if (typeof evaled !== "string") evaled = util.inspect(evaled, { depth: 0 });
        const output = this.clean(evaled);
        if (output.length > 1016) {
          return message.channel.send(new Attachment(Buffer.from(output), "output.txt"));
        }
        const embed = client.utils.embed()
          .setColor(0x10ce66)
          .setDescription(`${message.author.username}, here are the results of the \`${prefix}eval\` command`)
          .setAuthor(message.author.username, message.author.avatarURL)
          .setTimestamp()
          .addField(":inbox_tray: **INPUT**", `\`\`\`js\n${code}\n\`\`\``)
          .addField(":outbox_tray: **OUTPUT**", `\`\`\`js\n${output}\n\`\`\``)
          .setFooter(`${prefix}eval`)
        this.lastResult = output;
        return message.channel.send(/*"js", output*/{ embed });
      } catch (err) {
        const errorEmbed = client.utils.embed()
          .setColor("0xE20D0D")
          .setDescription(`${message.author.username}, the \`${prefix}eval\` command returned an error`)
          .setAuthor(message.author.username, message.author.avatarURL)
          .setTimestamp()
          .addField(":inbox_tray: **INPUT**", `\`\`\`js\n${code}\n\`\`\``)
          .addField(":outbox_tray: **OUTPUT**", `\`\`\`js\n${this.clean(err)}\n\`\`\``)
          .setFooter(`${prefix}eval`)
        return message.channel.send(errorEmbed)
      }
    }
  }

    clean(text) {
    if (typeof(text) === "string")
        return text.split(this.client.token).join("\"Well, yes but actually no.\"").replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
    }
}