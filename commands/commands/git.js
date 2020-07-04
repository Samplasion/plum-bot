const util = require('util');
const Command = require('./../../classes/Command.js');
var Git = require("nodegit");

module.exports = class GitCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'git',
			group: 'commands',
			memberName: 'git',
			description: 'Manages the mirroring of the repo to the bot\'s code and viceversa.',
			details: 'Only the bot owner(s) may use this command.',
      permLevel: 10,
			args: [
				{
					key: 'argument',
					prompt: 'what would you like to do?',
					type: 'string',
          oneOf: ["pull", "push", "latest"],
          default: "lastest"
				},
        {
          key: "args",
          type: "string",
          prompt: "",
          default: "",
        }
			]
		});
	}
  
  // hasPermission(msg) {
    // if (!this.client.isOwner(msg.author)) return 'only the bot owner(s) may use this command.';
    // return true;
  // }

	async run(message, { argument, args }) {
    this.git = 
    return this[argument](message, args);
  }
  
  async pull(msg, args) {
    
  }
  
  async push(msg, args) {
    
  }
  
  async latest(msg) {
    
  }
}