const { Command } = require('discord.js-commando');
const { RichEmbed } = require("discord.js");
const { inspect } = require("util");

class CommandsCommand extends Command {
  constructor(client) {
      super(client, {
          name: 'help',
          aliases: ["halp"],
          group: 'Bot Utilities',
          memberName: 'help',
          description: 'Changes the client configuration for the server',
          examples: ["conf set welcomeMessage Welcome, {{user}}, to this server!"],
          guildOnly: true,
          args: [
            {
              key: "commandName",
              label: "command",
              type: "string",
              default: null,
            },
          ],
          minPerm: 3
      });
  }

	async run(msg, { commandName }) {
		let embed = this.client.util.embed()

		let description;
		let command;

		let categories = Array.from(this.client.commandHandler.categories.entries());
		let cats = categories.map(arr => arr[1]).sort((c1, c2) => c1.id.localeCompare(c2.id));

		let cmds = cats.map(cat => Array.from(cat.entries()).map(c => c[1])).flat();

		if (this.isGood(commandName)) {
			let commandExists = this.client.commandHandler.aliases.get(commandName);
			if (this.isGood(commandExists)) {
				command = this.client.commandHandler.modules.get(commandExists);
				if (command.description) {
					description = command.description
					if (command.description.content)
						description = command.description.content;
				}

				if (command.aliases && command.aliases.filter && command.aliases.filter(al => al !== command.id).length)
					embed.addField(("Aliases"), command.aliases.filter(al => al !== command.id).map(alias => `\`${alias}\``).join(", "))

				if (command.category)
					embed.addInline(("Category"), (command.category.id))

				let usage;
				if (command.description && command.description.usage)	usage = command.description.usage;
				if (command.usage)										usage = command.usage;

				if (usage)
					embed.addField(("Usage"), `\`${usage}\``)

				if (this.isGood(command.args)) {
					for (var arg of command.args) {
						if (!arg.description) {
							switch (arg.id) {
								case 'IP':
									arg.description = "This is the server's IP address.";
									break;
								case 'images':
									arg.description = 'These are the images for the command. This can be either attachments, user mentions, user IDs, user names, links or if the channel has an image posted beforehand within the past 50 messages: none. If you use multiple links and/or attachments, you can even layer the image.';
									break;
							}
						}
					}

					embed.addField("Command Arguments", command.args.map(arg => `**${arg.id}** - ${arg.description}`).join("\n"))
				}

				let commandPermissions = [];
				if (this.isGood(command.userPermissions)) {
					if (typeof command.userPermissions == 'function')
						commandPermissions.push("Special Case");
					else
						command.userPermissions.forEach(perm => commandPermissions.push('`' + perm + '`'))
				}

				switch (command.channel) {
					case 'guild':
						commandPermissions.push(('Server Only'));
						break;
					case 'dm':
						commandPermissions.push(('Direct Messages Only'));
						break;
				}

				if (command.ownerOnly)
					commandPermissions.push(('Owner only'));

				if (this.isGood(commandPermissions))
					embed.addInline('Restrictions', commandPermissions.join(' | '));

				let examples;
				if (command.description && command.description.examples)	examples = command.description.examples;
				if (command.examples)										examples = command.examples;

				if (examples)
					embed.addField(("Examples"), (typeof examples == 'string' ? `\`${examples}\`` : examples.map(example => "`" + example + "`").join("\n")))

				return msg.channel.send(command.id + (description ? ': ' + (description.join ? description.map(d => (d)).join(" - ") : (description)) : ''), {embed});
			}

			let category = this.client.commandHandler.categories.get(titleCase(global.translate.backwards(msg.author.lang, commandName)))
			if (!this.isGood(category))
				category = this.client.commandHandler.categories.get(titleCase(commandName))

			if (!this.isGood(category))
				return msg.util.send(("Invalid command/category name. Please try again"));

			let commands = cmds && cmds.filter ? cmds.filter(c => c instanceof Command).filter(c => c.category.id == category).sort((a, b) => a.id.localeCompare(b.id)) : cmds;
			let makeFields = commands.length < 20;

			description = "";

			let commandList = [];
			commands.forEach(command => {
				description = "";

				if (!makeFields) {
					description += `**${command.id}**`;

					if (command.description) {
						description += ': ';

						if (command.description.content)
							description += (command.description.content.join ? command.description.content.map(d => (d)).join("\n") : (command.description.content));
						else {
							description += (command.description.join ? command.description.map(d => (d)).join("\n") : command.description);
						}
					}

					commandList.push(description)
				} else {
					if (command.description) {
						if (command.description.content)
							description += (command.description.content.join ? command.description.content.map(d => (d)).join("\n") : (command.description.content));
						else
							description += (command.description.join ? command.description.map(d => (d)).join("\n") : (command.description));
					}

					embed.addField(command.id, description || (command.description.content ? command.description.content : command.description) || 'No description available')
				}
			});

			if (commands.length > 0) {
				if (!makeFields)
					embed.setDescription(commandList.join('\n'))

				embed.setFooter(("Total Commands in this category: {0}", commands.length));

				if (category.has('color'))
					embed.setColor(category.get('color'))

				return msg.channel.send(("Category listing: {0}", (category.id)), embed);
			}
		} else {
			// General command listing
			// {id: <name>, aliases: [<name>, <name>...], description: <desc>, category.id: <category>}
			let text = "<:Yamamura:633898611125649418> | " + ("{0}'s Command Listing", this.client.user.username) + "\n\n"

					 + ("Type a command or category name for information on that item") + "\n"
					 + ("To run a command in {0}, use `{1}command` or `{2} command`. For example, `{1}invite` or `{2} invite`.", msg.guild ? msg.guild.name : "this DM box", this.handler.prefix(msg), `@${this.client.user.username}#${this.client.user.discriminator}`)

					 + (this.client.website ? ("\n\n" + ("A full list of commands can be viewed on our website: {0}", `${this.client.website.URL}/commands`)) : '')

			cats.forEach(category => {
				let catCmds = cmds.filter(c => c instanceof Command).filter(c => c.category.id == category).sort((a, b) => a.id.localeCompare(b.id));
				if (catCmds.length > 0) embed.addInline(`${(category.id)} [${catCmds.length}]`, category.has('description') ? (category.get('description')) : ('No description available.'));
			});

			embed.setFooter(("Total Commands: {0}", cmds.length));

			return msg.util.send(text, embed);
		}
	}
};

function isEmpty(value) { //Function to check if value is really empty or not
	return (value == null || value.length === 0);
}

function titleCase(str) {
	str = str.toLowerCase().split(' ');
	let final = [];
	for (let word of str) {
		final.push(word.charAt(0).toUpperCase() + word.slice(1));
	}
	return final.join(' ')
}