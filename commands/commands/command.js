const Command = require('./../../classes/Command.js');

let titleCase = str => str[0].toUpperCase() + str.substr(1).toLowerCase();
let template = (command, group, desc) => `
const Command = require('./../../classes/Command.js');

module.exports = class ${titleCase(command)}Command extends Command {
	constructor(client) {
		super(client, {
			name: '${command.toLowerCase()}',
			group: '${group}',
			memberName: '${command.toLowerCase()}',
			description: "${desc}",
		});
	}

	async run(msg) {
        // Code
	}
};
`.trim();

module.exports = class PingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'command',
			group: 'commands',
			memberName: 'command',
			description: "Returns a valid command boilerplate code.",
			permLevel: 10,
            args: [
                {
                    key: "name",
                    type: "string",
                    prompt: "",
                },
                {
                    key: "group",
                    type: "string",
                    prompt: "",
                    default: "commands"
                },
                {
                    key: "desc",
                    type: "string",
                    prompt: "",
                    default: "A common description briefly explains the code."
                }
            ]
		});
	}

	async run(msg, { name, group, desc }) {
        return msg.channel.send("```js\n" + template(name, group, desc) + "\n```");
	}
};