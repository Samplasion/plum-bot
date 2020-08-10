const Command = require('../../classes/commands/Command');
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
			description: 'commands/help:DESCRIPTION',
			details: "commands/help:DETAILS",
            formatExplanation: {
                "[command]": "If specified, gets a command which name is most similar to this."
            },
			examples: ['help', 'help prefix'],
			guarded: true,

			args: [
				{
                    key: 'command',
                    label: "command",
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

        if (command && !command.hidden && args.command != "4") {
            let embed = msg.makeEmbed()
                .setFooter(msg.t("commands/help:PREFIX", { prefix }));

            embed.setTitle(msg.t("commands/help:COMMAND.TITLE", { 
                info: this.client.utils.emojis.info,
                command: command.name 
            }));
            embed.setDescription(msg.t(command.description) +
                (command.details ? "\n\n" + msg.t(command.details) : "") + "\n\n" +
                msg.t("commands/help:COMMAND.MORE_INFO", {
                    command: command.name
                }));

            let server  = this.client.utils.emojis.server,
                user    = this.client.utils.emojis.user,
                channel = this.client.utils.emojis.channel,
                premium = this.client.utils.emojis.premium,
                lock    = this.client.utils.emojis.lock,
                numbers = this.client.utils.emojis.numbers,
                paper   = this.client.utils.emojis.paper,
                message = this.client.utils.emojis.message,
                alias   = this.client.utils.emojis.alias

            let lims = [];
            if (command.guildOnly)
                lims.push(msg.t("commands/help:LIMITATIONS.GUILD", { server }));
            if (command.ownerOnly || command.permLevel == 10)
                lims.push(msg.t("commands/help:LIMITATIONS.OWNER", { user }));
            if (command.nsfw)
                lims.push(msg.t("commands/help:LIMITATIONS.NSFW", { channel }));
            if (command.premium)
                lims.push(msg.t("commands/help:LIMITATIONS.PREMIUM", { premium }));

            if (lims.length) embed.addField(msg.t("commands/help:LIMITATIONS.TITLE", { lock }), lims.map(lim => ` - ${lim}`).join("\n"), true);

            let perm = this.client.permissions.get(command.permLevel);
            embed.addField(msg.t("commands/help:LEVEL", { numbers }), `**${msg.t(perm.name)}** [${perm.level}]`, true)

            let ex = msg.t(`commands/${command.name}:EXAMPLES`, { returnObjects: true })
            if (ex && ex.length && Array.isArray(ex)) {
                embed.addField(msg.t("commands/help:EXAMPLES_KEY", { paper }), ex.map(ex => ` - ${msg.prefix}${ex}`).join("\n"));
            }

            embed.addField(msg.t("commands/help:USAGE", { message }), `\`${msg.prefix}${command.name}${command.format ? " " + command.format : ""}\``, true);

            if (command.aliases.length)
                embed.addField(msg.t("commands/help:ALIAS", { count: command.aliases.length, alias }), command.aliases.map(al => ` - ${msg.prefix}**${al}**`).join("\n"), true);

            return msg.channel.send(embed);
        } else {
            /** @type {PlumEmbed[]} */
            let embeds = [];

            let cmdFilter = cmd => !cmd.hidden && (cmd.isUsable(msg) || cmd.premium) && (msg.guild ? msg.member : msg.author).level.level >= cmd.permLevel;

            groups.filter(grp => grp.commands.some(cmdFilter)).sort((g1, g2) => g1.name.localeCompare(g2.name)).forEach(grp => {
                let fieldText = [];

                // eslint-disable-next-line no-unused-vars
                for (let [id, cmd] of grp.commands.filter(cmdFilter).entries()) {
                    fieldText.push(`${cmd.premium ? "🔸" : "▫️"} ${prefix}**${cmd.name}**: ${msg.t(cmd.description)}`);
                }

                embeds.push(
                    msg.makeEmbed()
                        .setTitle(`${this.client.utils.emojis.info} ${msg.t("commands/help:CMD_LIST")}`)
                        .addFields(this.client.utils.embedSplit(fieldText.join("\n"), msg.t(grp.name))));
            });

            embeds.forEach((embed, index) => {
                embed
                    .setDescription(msg.t("common:PAGINATION", {
                        page: index + 1,
                        pages: embeds.length
                    }));
                if (msg.guild.me.hasPermission("MANAGE_MESSAGES"))
                    embed.setFooter(msg.t("common:EXPIRATION", { minutes: 2 }));
                embed.addField(msg.t("common:USEFUL_LINKS"), msg.t("common:USEFUL_LINKS_TEXT"));
            });

            console.log(embeds.map(e => e.fields[0].name));

            let e = this.client.utils.emojis;
            let more = msg.makeEmbed()
                .setTitle(msg.t("commands/help:MORE_HELP.TITLE", { info: e.info }))
                .setDescription(msg.t("commands/help:MORE_HELP.DESC"))
                .addField(msg.t("commands/help:MORE_HELP.FIELD.TITLE"), msg.t("commands/help:MORE_HELP.FIELD.DESC"))
                .addField(msg.t("common:USEFUL_LINKS"), msg.t("common:USEFUL_LINKS_TEXT"))

            if (!embeds.length) {
                return msg.error(msg.t("commands/help:NO_CMDS"));
            }

            return this.pagination(msg, embeds, more);
        }
	}
};