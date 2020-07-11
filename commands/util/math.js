const util = require('util');
const { MessageAttachment: Attachment } = require('discord.js');
const Command = require('./../../classes/Command.js');
const { evaluate } = require('mathjs')

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'math',
      aliases: ["calc"],
			group: 'util',
			memberName: 'math',
			description: 'Evaluates a mathematic expression.',
      examples: ["math 10 / 2 + 3"], // = 8
			args: [
				{
					key: 'expr',
          label: 'expression',
					prompt: 'What code would you like to evaluate?',
					type: 'string'
				}
			]
		});
	}
  
  // hasPermission(msg) {
    // if (!this.client.isOwner(msg.author)) return 'only the bot owner(s) may use this command.';
    // return true;
  // }

	async run(message, { expr }) {
        let res;
        try {
            res = evaluate(expr);
        } catch (error) {
            return message.error("You're supposed to enter a valid mathematical equation.");
        }
    
    const embed = this.client.utils.embed()
      .setColor(0x10ce66)
      .setDescription(`${message.author.username}, here are the results of your expression`)
      .setTimestamp()
      .addField(":inbox_tray: **INPUT**", expr)
      .addField(":outbox_tray: **OUTPUT**", res)
    return message.channel.send(/*"js", output*/{ embed });
  }
}