const util = require('util');
const { MessageAttachment: Attachment } = require('discord.js');
const Command = require('./../../classes/Command.js');
const safeEval = require('safe-eval')

module.exports = class FixdbCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'fixdb',
			group: 'commands',
			memberName: 'fixdb',
			description: 'Fixes the database by adding missing keys to guild configurations.',
			details: 'Only the bot owner(s) may use this command.',
      permLevel: 10,
		});
	}
  
  // hasPermission(msg) {
    // if (!this.client.isOwner(msg.author)) return 'only the bot owner(s) may use this command.';
    // return true;
  // }

	async run(message, { script }) {
    let guilds = [...this.client.guilds.cache.values()];

    await message.channel.send(`Fixing the database for ${this.client.utils.plural(guilds.length, "server")}...`);

    for (let guild of guilds) {
      console.log(guild, guilds);
      guild.config.fix();
    }

    return this.client.utils.sendOkMsg(message, "Done!");
  }
}

const clean = text => {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}
