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
      let embed = new PlumEmbed(this.client)
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
      
      let embeds = [];
      let index = 0;
      
      groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && cmd.isUsable(msg))).sort((g1, g2) => g1.name.localeCompare(g2.name)).forEach(grp => {
        let fieldText = [];
        
        for (let [id, cmd] of grp.commands.entries()) {
          fieldText.push(`• ${prefix}**${cmd.name}**: ${cmd.description}`);
        }
        
        embeds.push(
          new PlumEmbed(this.client)
            .setTitle("List of all commands")
            .setDescription(`Page ${embeds.length + 1}`)
            .addField(grp.name, fieldText.join("\n")));
      });
      
      embeds.forEach(embed => {
        embed
          .setDescription(`${embed.description} of ${embeds.length}`)
          .setFooter(`This menu will expire in 2 minutes`);
      });
      
      const R = [
        ["⬅️", (collector) => index--],
        ["🛑", (collector) => collector.stop("manual")],
        ["➡️", (collector) => index++],
      ];
      
      let message = await msg.channel.send(embeds[0]);
      for (let [react, cb] of R) {
        await message.react(react);
      }
      
      const filter = (reaction, user) => {
        return R.map(r => r[0]).some(emoji => reaction.emoji.name === emoji) && user.id === msg.author.id;
      };
      
      const collector = message.createReactionCollector(filter, { time: 120000 });

      collector.on('collect', async (reaction, user) => {
        await reaction.users.remove(msg.author.id);
        
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
          m = await msg.channel.send("Interactive menu ended successfully.");
        } else {
          m = await msg.channel.send("Interactive menu ended for inactivity.");
        }
        m.delete({ timeout: 10000 });
      });
    }
	}
};

function disambiguation(items, label, property = 'name') {
	const itemList = items.map(item => `"${(property ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ');
	return `Multiple ${label} found, please be more specific: ${itemList}`;
}