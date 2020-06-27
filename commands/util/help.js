const Command = require('../../classes/Command');
const PlumEmbed = require("../../classes/Embed");
const { oneLine, stripIndents } = require('common-tags');
const { inspect } = require("util");

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			aliases: ['commands'],
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
			examples: ['help', 'help prefix'],
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to view the help for?',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
    /*
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = stripIndents`
					${oneLine`
						__Command **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (Usable only in servers)' : ''}
						${commands[0].nsfw ? ' (NSFW)' : ''}
					`}
					**Format:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**Aliases:** ${commands[0].aliases.join(', ')}`;
				help += `\n${oneLine`
					**Group:** ${commands[0].group.name}
					(\`${commands[0].groupID}:${commands[0].memberName}\`)
				`}`;
				if(commands[0].details) help += `\n**Details:** ${commands[0].details}`;
				if(commands[0].examples) help += `\n**Examples:**\n${commands[0].examples.join('\n')}`;

				const messages = [];
				try {
					messages.push(await msg.direct(help));
					if(msg.channel.type !== 'dm') messages.push(await msg.reply('Sent you a DM with information.'));
				} catch(err) {
					messages.push(await msg.reply('Unable to send you the help DM. You probably have DMs disabled.'));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.say('Multiple commands found. Please be more specific.');
			} else if(commands.length > 1) {
				return msg.say(disambiguation(commands, 'commands'));
			} else {
				return msg.say(
					`Unable to identify command. Use ${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} to view the list of all commands.`
				);
			}
		} else {
			const messages = [];
      messages.push(await msg.say(stripIndents`
        ${oneLine`
          To run a command in ${msg.guild ? msg.guild.name : 'any server'},
          use ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
          For example, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
        `}
        To run a command in this DM, simply use ${Command.usage('command', null, null)} with no prefix.
        Use ${this.usage('<command>', null, null)} to view detailed information about a specific command.
        Use ${this.usage('all', null, null)} to view a list of *all* commands, not just available ones.
        __**${showAll ? 'All commands' : `Available commands in ${msg.guild || 'this DM'}`}**__
        ${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
          .map(grp => stripIndents`
            __${grp.name}__
            ${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
              .map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
            }
          `).join('\n\n')
        }
      `, { split: true }));
			return messages;
		}*/
    let prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
    
    let groups = this.client.registry.groups;
    let command = args.command && this.client.registry.findCommands(args.command, false, msg)[0];
    
    if (command) {
      let embed = new PlumEmbed()
        .setAuthor(this.client.user.username, this.client.user.avatarURL())
        .setFooter(`The prefix for this server is: ${prefix}`);
      
      embed.setTitle(`Help for command: ${command.name}`);
      embed.setDescription(command.description 
                          + (command.details ? "\n\n" + command.details : ""));
      
      if (["guildOnly", "ownerOnly", "nsfw"].some(el => command[el])) {
        let lims = [];
        if (command.guildOnly)
          lims.push("Guild only");
        if (command.ownerOnly)
          lims.push("Bot owner only");
        if (command.nsfw)
          lims.push("NSFW channels only");
        
        embed.addField("Limitations", lims.map(lim => ` - ${lim}`).join("\n"));
      }
      if (command.examples && command.examples.length) {
        embed.addField("Examples", command.examples.map(ex => ` - ${ex}`).join("\n"));
      }
    
      return msg.say(embed);
    } else {
      await msg.react('🍎');
			await msg.react('🍊');
			await msg.react('🍇');
      
      let embeds = [];
      let index = 0;
      
      const filter = (reaction, user) => {
        return ['🍎', '🍊', '🍇'].some(emoji => reaction.emoji.name === emoji) && user.id === msg.author.id;
      };
      
      groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && cmd.isUsable(msg))).forEach(grp => {
        let fieldText = [];
        
        for (let [id, cmd] of grp.commands.entries()) {
          fieldText.push(`• ${prefix}**${cmd.name}**: ${cmd.description}`);
        }
        
        embeds.push(
          new PlumEmbed()
            .setTitle("List of all commands")
            .setFooter(`The prefix for this server is: ${prefix}`)
            .addField(grp.name, fieldText.join("\n")));
      })
      
      msg.say(embeds[0]);
      
      const collector = msg.createReactionCollector(filter, { time: 60000 });

      collector.on('collect', (reaction, user) => {
        console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
      });

      collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`);
      });
    }
	}
};

function disambiguation(items, label, property = 'name') {
	const itemList = items.map(item => `"${(property ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ');
	return `Multiple ${label} found, please be more specific: ${itemList}`;
}