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
    let prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
    
    let groups = this.client.registry.groups;
    let command = args.command && this.client.registry.findCommands(args.command, false, msg)[0];
    
    if (command) {
      let embed = this.client.utils.embed()
        .setFooter(`The prefix for this server is: ${prefix}`);
      
      embed.setTitle(`${this.client.utils.emojis.info} Help for command: ${command.name}`);
      embed.setDescription(command.description 
                          + (command.details ? "\n\n" + command.details : ""));
      
      let lims = [];
      if (command.guildOnly)
        lims.push(`${this.client.utils.emojis.server} Guild only`);
      if (command.ownerOnly || command.permLevel == 10)
        lims.push(`${this.client.utils.emojis.user} Bot owner only`);
      if (command.nsfw)
        lims.push(`${this.client.utils.emojis.channel} NSFW channels only`);

      if (lims.length) embed.addField(`${this.client.utils.emojis.lock} Limitations`, lims.map(lim => ` - ${lim}`).join("\n"), true);
      
      let perm = this.client.permissions.get(command.permLevel);
      embed.addField(`${this.client.utils.emojis.numbers} Level`, `**${perm.name}** [${perm.level}]`, true)
      
      if (command.examples && command.examples.length) {
        embed.addField(`${this.client.utils.emojis.paper} Examples`, command.examples.map(ex => ` - ${ex}`).join("\n"));
      }
    
      return msg.channel.send(embed);
    } else {
      let embeds = [];
      let index = 0;
      
      groups.filter(grp => grp.commands.some(cmd => {
        return !cmd.hidden && cmd.isUsable(msg) && (msg.guild ? msg.member : msg.author).level.level >= cmd.permLevel
      })).sort((g1, g2) => g1.name.localeCompare(g2.name)).forEach(grp => {
        let fieldText = [];
        
        for (let [id, cmd] of grp.commands.filter(cmd => (msg.guild ? msg.member : msg.author).level.level >= cmd.permLevel).entries()) {
          fieldText.push(`• ${prefix}**${cmd.name}**: ${cmd.description}`);
        }
        
        embeds.push(
          this.client.utils.embed()
            .setTitle(`${this.client.utils.emojis.info} List of all commands`)
            .setDescription(`Page ${embeds.length + 1}`)
            .addField(grp.name, fieldText.join("\n")));
      });
      
      embeds.forEach(embed => {
        embed
          .setDescription(`${embed.description} of ${embeds.length}`)
          .setFooter(`This menu will expire in 2 minutes`);
      });
      
      if (!embeds.length) {
        return this.client.utils.sendErrMsg(msg, "You have no usable commands. Contact the owner for more info.");
      }
      
      if (!msg.guild.me.hasPermission("MANAGE_MESSAGES")) {
        let index = Math.max(0, (parseInt(args.command) == NaN ? 1 : parseInt(args.command)) - 1 % embeds.length);
        let embed = embeds[index || 0];
        if (!embed) return this.client.utils.sendErrMsg(msg, `There was an error finding page ${index+1}. Make sure `
                                                        + `the page is a number between 1 and ${embeds.length}.`);
        embed.setDescription(`${embed.description} • Use \`${prefix}help [page]\` to choose another page.`);
        msg.channel.send(embed);
        return;
      }
      
      const R = [
        [this.client.utils.emojis.prev, (collector) => index--],
        [this.client.utils.emojis.stop, (collector) => collector.stop("manual")],
        [this.client.utils.emojis.next, (collector) => index++],
      ];
      
      console.error(embeds);
      let message = await msg.channel.send(embeds[0]);
      for (let [react, cb] of R) {
        await message.react(react);
      }
      
      const filter = (reaction, user) => {
        return R.map(r => r[0]).some(emoji => reaction.emoji.name === emoji) && user.id === msg.author.id;
      };
      
      const collector = message.createReactionCollector(filter, { time: 120000 });

      collector.on('collect', async (reaction, user) => {
        if (msg.guild.me.hasPermission("MANAGE_MESSAGES")) await reaction.users.remove(msg.author.id);
        
        var matching = R.filter(r => r[0] == reaction.emoji.name);
        if (!matching.length) return;
        
        matching[0][1](collector);
        if (index < 0) index = embeds.length-1;
        index %= embeds.length;
        
        message.edit(embeds[index]);
      });

      collector.on('end', async (collected, reason) => {
        msg.reactions.cache.forEach(r => r.remove());
        let m;
        if (reason === "manual") {
          m = await message.edit("Interactive menu ended successfully.");
        } else {
          m = await message.edit("Interactive menu ended for inactivity.");
        }
        // m.delete({ timeout: 10000 });
      });
    }
	}
};

function disambiguation(items, label, property = 'name') {
	const itemList = items.map(item => `"${(property ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ');
	return `Multiple ${label} found, please be more specific: ${itemList}`;
}