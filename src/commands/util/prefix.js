const { stripIndents, oneLine } = require('common-tags');
const Command = require('../../classes/commands/Command.js');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'prefix',
			group: 'util',
			memberName: 'prefix',
			description: 'Shows or sets the command prefix.',
			format: '[prefix/"default"/"none"]',
			details: oneLine`
				If no prefix is provided, the current prefix will be shown.
				If the prefix is "default", the prefix will be reset to the bot's default prefix.
				If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands.
				Only administrators may change the prefix.
			`,
            formatExplanation: {
                "[prefix]": "If present, and the user's level is ≥ 3, the prefix will be changed. Otherwise, it'll be simply shown"
            },
			examples: ['prefix', 'prefix -', 'prefix omg!', 'prefix default', 'prefix none'],
			args: [
				{
					key: 'prefix',
					prompt: 'What would you like to set the bot\'s prefix to?',
					type: 'string',
//				max: 15,
					default: ''
				}
			]
		});
	}

	async run(msg, args) {

		// Just output the prefix
		if(!args.prefix) {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
			return msg.channel.send(
				this.client.utils.embed()
					.setTitle(this.client.utils.emojis.info + " Prefix")
					.setDescription(stripIndents`
						${prefix ? `The command prefix is \`\`${prefix}\`\`.` : 'There is no command prefix.'}
						To run commands, use ${msg.anyUsage('command')}.`)
			);
		}

		// Check the user's permission before changing anything
		if(msg.guild) {
			if(msg.member.level.level < 3) {
				return this.client.utils.sendErrMsg(msg, 'Only administrators may change the command prefix.');
			}
		} else if(msg.author.level.level < 9) {
			return this.client.utils.sendErrMsg(msg, 'Only the bot owner(s) may change the global command prefix.');
		}

		// Save the prefix
		const lowercase = args.prefix.toLowerCase();
		const prefix = lowercase === 'none' ? '' : args.prefix;
		let response;
		if(lowercase === 'default') {
			if(msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;
			const current = this.client.commandPrefix ? `\`\`${this.client.commandPrefix}\`\`` : 'no prefix';
			response = `Successfully reset the command prefix to the default (currently ${current}).`;
		} else {
			if(msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;
			response = prefix ? `Successfully set the command prefix to \`\`${args.prefix}\`\`.` : 'successfully removed the command prefix entirely.';
		}

		await msg.info(`${response} To run commands, use ${msg.anyUsage('command')}.`);
		return null;
	}
};
