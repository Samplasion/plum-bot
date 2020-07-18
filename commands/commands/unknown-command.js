const Command = require('./../../classes/Command.js');
const getDistance = require("fast-levenshtein").get;

module.exports = class UnknownCommandCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unknown-command',
            group: 'commands',
            memberName: 'unknown-command',
            description: "This is not a real command. It's called whenever a nonexistent command is called.",
            hidden: true,
            unknown: true
        });
    }

    async run(msg) {
        let split = msg.content.split(/\s+/);
        let name;
        if (split[0] == msg.argString) {
            name = split[1];
        } else {
            name = split[0].substr(msg.argString.length);
        }
        // let name = console.log([0].substr(msg.argString.length));

        // TODO: check for custom commands

        // Check for custom tags
        if (msg.guild.tags.list.map(t => t.name).includes(name)) {
            msg.channel.send(msg.guild.tags.list.filter(t => t.name == name)[0].text);
            return;
        }

        // Show the "Related commands" msg

		if (!msg.guild.config.get("unknowncommand")) return;

		let distances = [];
		let distanceBetween;
		for (let alias of this.client.registry.commands.map(cmd => cmd.aliases.concat([cmd.name])).flat()) {
            // console.log(alias);
			distanceBetween = getDistance(alias, name);
			if (distanceBetween > 2) continue;

			distances.push({
				alias: alias,
				command: this.client.registry.commands.find(c => c.aliases.includes(alias) || c.name == alias),
				distance: distanceBetween
			});
		}

		let text = `${name} is not a valid command, nor a tag.\n`;
		let suggestedCommands = [];
		let iterated = [];

		if (distances.length) {
			distances.sort((a, b) => a.dist - b.dist);

			let currentCmd;
			let description;

			for (const index in distances) {
				currentCmd = distances[index].command;
				if (!currentCmd) continue;
				if (iterated.includes(currentCmd.id)) continue;

				description = false;
				if (currentCmd.description) {
					description = currentCmd.description;
				}

				suggestedCommands.push(`${parseInt(index)+1}. **${distances[index].alias}${description ? '**: ' + (description.join ? description.map(d => d).join(" - ") : description) : '**'}`);
				iterated.push(currentCmd.id);
			}
		}

		if (suggestedCommands.length)
			text = text
                + "However, here are some commands that you might be looking for:"
                + "\n\n"
				+ suggestedCommands.join("\n")
                + "\n\n"

		text += "If you'd like to see more commands, check out the help command or our website.\n\n"
                + "_This message will be deleted in 10 seconds._";

		try {
			if (suggestedCommands.length) {
                let invalidCommandMessage = await msg.channel.send(text);
                invalidCommandMessage.delete({timeout: 10000});
            }
		} catch (e) {
			console.error(e);
		}

		return;
    }
};