const Command = require('./../../classes/Command.js');
const p = require("phin");
const domcolor = require("domcolor");

module.exports = class ServerInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'serverinfo',
            aliases: ["si"],
            group: 'util',
            memberName: 'serverinfo',
            description: "Shows information about this server.",
            details: `With the \`plain-roles\` flag, the roles will be shown as names, not as mentions.`,
            args: [],
            format: "[--advanced|--adv] [--plain-roles|--plainroles|--pr]"
        });
    }

    pad(n) {
        return n < 10 ? "0" + n : n;
    }

    fmtDate(date) {
        return `${date.getFullYear()}/${this.pad(date.getMonth()+1)}/${this.pad(date.getDate())} ${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}`
    }

    async run(msg) {
        const e = this.client.utils.emojis;
        let guild = msg.guild;

        let ext = false;
        if (msg.flags.guild && typeof msg.flags.guild == "string" && msg.author.level.level >= 9) {
            if (this.client.guilds.cache.get(msg.flags.guild)) {
                ext = true;
                guild = this.client.guilds.cache.get(msg.flags.guild);
            } else return msg.error("That guild doesn't exist in my cache.");
        }
        
        await guild.fetch();
        await guild.roles.fetch();

        let b = guild.premiumSubscriptionCount;

        // Get the image as a buffer
        let { body: img } = await p(guild.iconURL({ format: "png" }));
        // Obtain the color
        let { hex: color } = await domcolor(img);

        let embed = this.client.utils.embed()
            .setAuthor(guild.name, guild.iconURL() || this.client.user.avatarURL())
            .setTitle(`${e.server} Server Info`)
            .setDescription(`• ${e.calendar} | Server created at **${this.fmtDate(guild.createdAt)}**
  • ${e.user} | Server created by: **${guild.owner ? guild.owner.user.tag : "Unknown user"}**`)
            .addField(`${e.channel} Channels`, `• ${e.numbers} | Total: **${guild.channels.cache.size}**
  • ${e.message} | Text: **${guild.channels.cache.filter(c => c.type == "text").size}**
  • ${e.audio} | Voice: **${guild.channels.cache.filter(c => c.type == "voice").size}**
  • ${e.category} | Categories: **${guild.channels.cache.filter(c => c.type == "category").size}**`)
            .addField(`${e.diamond} Emojis`, guild.emojis.cache.map(e => `${e}`).join(" ") || "No emojis")
            .addField(`${e.users} Roles`, guild.roles.cache.filter(r => r.id != r.guild.id).sort((r1, r2) => r2.comparePositionTo(r1)).map(r => ext || ["plainroles", "pr"].some(f => msg.flags[f]) ? r.name : `<@&${r.id}>`).join(", ") || "No roles")
            .addField(`${e.boost} Server Level`, `${guild.premiumTier ? `Level ${guild.premiumTier}` : "Base level"} (${this.client.utils.plural(b, "boost")})`)
            .setFullFooter("ID: " + guild.id)
            .setColor(color);

        if (guild.icon)
            embed.setThumbnail(guild.iconURL());

        if (guild.banner)
            embed.setImage(guild.bannerURL());

        if (guild.description)
            embed.setDescription(guild.description + "\n\n" + e.description);

        if (["advanced", "adv"].some(f => msg.flags[f])) {
            let emcf = {
                DISABLED: "Don't scan any media content.",
                MEMBERS_WITHOUT_ROLES: "Scan media content from members without a role.",
                ALL_MEMBERS: "Scan media content from all members."
            };
            let verification = {
                NONE: '**None**\nUnrestricted',
                LOW: '**Low**\nMust have a verified email on Discord.',
                MEDIUM: '**Medium**\nMust also be registered on Discord for longer than 5 minutes.',
                HIGH: '**High**\nMust also be a member of this server for longer than 10 minutes.',
                VERY_HIGH: '**Highest**\nMust have a verified phone on their Discord account.'
            }
            embed
                .addField(`${e.server} Region`, guild.region.split(" ").map(r => r[0].toUpperCase() + r.substr(1)).join(" ").replace("Us-", "US "))
                .addField(`${e.lock} Security Level`, verification[guild.verificationLevel], true)
                .addField(`${e.name} Explicit Media Content Filter`, emcf[guild.explicitContentFilter], true)

        }

        msg.channel.send(embed);
    }
};