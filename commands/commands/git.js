const Command = require('./../../classes/Command.js');
const exec = require("util").promisify(require("child_process").exec);

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
    return this[argument](message, args.split(/\s+/g));
  }
  
  async pull(msg, args) {
    
  }
  
  async push(msg, args) {
    let message = args.join(" ").replace(/"/g, "\\\"");
    
    let output = await this.execMult([
      "git add .",
      `git commit -m "${message}"`,
      "git push -u origin master"
    ]);
    
    console.log(output);
    
    return msg.channel.send("```" + output.join("\n") + "```");
  }
  
  async execMult(commands) {
    let output = [];
    
    for (let cmd of commands) {
      try {
        let res = await exec(cmd);
        output.push(res.stdout);
      } catch (err) {
        output.push(err.stderr);
      }
    }
    
    return output;
    
  }
  
  async latest(msg) {
    
  }
}