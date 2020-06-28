const Command = require('../../classes/Command');
const Embed = require("../../classes/Embed");

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'setup',
			group: 'util',
			memberName: 'changelog',
			description: 'Logs a new change to the #changelog channel in the support server.',
			details: 'Only the bot owner(s) may use this command.',
			ownerOnly: true,

			args: []
		});
	}

	async run(msg, args) {
    
  }
}