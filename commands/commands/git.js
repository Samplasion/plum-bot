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
          default: "latest"
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

	async run(message, { argument, args: argstring }) {
    let args = argstring.split(/\s+/g);
    let flags = [];

    let i = args.length - 1;
    while (i >= 0) {
      if (args[i].startsWith("--force")) {
        flags.push(args.splice(i, 1).substr(2).toLowerCase());
      }
    }
    return await this[argument](message, args, flags);
  }
  
  async pull(msg, args, flags) {
    let output = await this.execMult([
      flags.includes("force") ? "git pull --force" : "git pull"
    ]);
    
    return msg.channel.send(
      this.client.utils.fastEmbed(
        "Pull result", 
        "```" + output.map(o => o.out).join("```\n```") + "```"
      )
    );
  }
  
  async push(msg, args) {
    let message = args.join(" ").replace(/"/g, "\\\"") || "Commit from command.";
    
    let commands = [
      "git add .",
      `git commit -m "${message}"`,
      `git push -u origin master ${flags.includes("force") ? "--force" : ""}`
    ];
    
    return this.runAndLog(msg, "Pull result", "", commands);
  }
  
  async latest(msg) {
    let data = await this.execMult([
      "git show --oneline -s"
    ]);
    
    let raw = data[1].out.split(" ");
    
    let commit = raw.shift();
    // let edited = raw.pop()
    
    raw = raw.join(" ");
    
    return msg.channel.send(
      this.client.utils.fastEmbed(
        "Bot Commit", 
        `The bot is at commit \`${commit}\``,
        [
          ["Commit message", raw]
        ]
      )
    );
  }
  
  async execMult(commands) {
    let output = [];
    
    commands.unshift(`git checkout ${process.env.BRANCH}`);
    
    for (let cmd of commands) {
      try {
        let res = await exec(cmd);
        output.push(res.stdout);
      } catch (err) {
        output.push(err.stderr);
      }
    }
    
    return output.map((out, i) => ({ name: commands[i], out }));
  }
  
  async runAndLog(msg, name, desc, commands) {
    let output = await this.execMult(commands);
    
    return msg.channel.send(
      this.client.utils.fastEmbed(
        name, 
        desc,
        output.map(({ name, out }) => {
          return [name, out ? "```" + out + "```" : "No output."]
        })
      )
    );
  }
}