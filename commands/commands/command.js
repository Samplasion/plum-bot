const Command = require('./../../classes/Command.js');

let titleCase = str => str[0].toUpperCase() + str.substr(1).toLowerCase();
let template = (command, group, desc, args, argNames = [], aliases = [], ) => `
const Command = require('./../../classes/Command.js');

module.exports = class ${titleCase(command)}Command extends Command {
	constructor(client) {
		super(client, {
			name: '${command.toLowerCase()}',${aliases ? "\n            aliases: [" + aliases.map(a => `"${a}"`) + "]," : ""}
			group: '${group}',
			memberName: '${command.toLowerCase()}',
			description: "${desc}",
            args: [${args}]
		});
	}

	async run(msg${argNames.length ? ", { " + argNames.join(", ") + " }": ""}) {
        // Code
	}
};
`.trim();

module.exports = class CommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'command',
			group: 'commands',
			memberName: 'command',
			description: "Returns a valid command boilerplate code.",
			permLevel: 10,
            formatExplanation: {
                "<name>": "The command's name",
                "[group]": "The command's group (defaults to `commands`)",
                "[desc]": "The command's description (defaults to a stub)"
            },
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
        let args = [];
        let argNames = [];
        if (msg.flags.args && typeof msg.flags.args == "string") {
            if (msg.flags.args.trim().endsWith(";"))
                msg.flags.args = msg.flags.args.trim().substr(0, msg.flags.args.trim().length-1);
            for (let arg of msg.flags.args.split(";")) {
                let [name, type] = arg.split(":").map(str => str.trim());
                argNames.push(name);
                let def = "";
                if (type.endsWith("?")) {
                    def = '\n    default: "",';
                    type = type.replace("?", "");
                }
                args.push(`{
    key: "${name}",
    type: "${type}",
    prompt: "",${def}
},`);
            }
        }

        let aliases = [];
        if (msg.flags.aliases && typeof msg.flags.aliases == "string") {
            for (let alias of msg.flags.aliases.split(",")) {
                alias = alias.trim();
                aliases.push(alias);
            }
        }

        return msg.channel.send("```js\n" + template(name, group, desc, !args.length ? "" : "\n" + args.map(l => l.split("\n").map(line => "   ".repeat(5) + line).join("\n")).join("\n") + "\n            ", argNames, aliases) + "\n```");
	}
};