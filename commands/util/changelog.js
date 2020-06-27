const Command = require('../../classes/Command');

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'changelog',
			group: 'util',
			memberName: 'changelog',
			description: 'Logs a new change to the #changelog channel in the support server.',
			details: 'Only the bot owner(s) may use this command.',
			ownerOnly: true,

			args: [
        {
          key: "version",
          prompt: "What's the new version number?",
          type: "string",
          validate: text => {
            let regex = /\d\.\d\.\d/g;
            return regex.test(text);
          }
        },
				{
					key: 'log',
					prompt: 'What\'s new?',
					type: 'string'
				}
			]
		});
	}

	async run(msg, { valog }) {
    msg.say("Well, shit.\n" + log);
	}
};
