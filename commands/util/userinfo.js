const Command = require('./../../classes/Command.js');
const { util: { permissions } } = require("discord.js-commando");
const { stripIndents } = require("common-tags");

module.exports = class UserInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'userinfo',
            aliases: ["ui"],
            group: 'util',
            memberName: 'userinfo',
            description: "Get info about someone.",
            args: [
               {
                   key: "member",
                   type: "member",
                   prompt: "",
                   default: msg => msg.member
               },
            ],
            formatExplanation: {
                "[member]": "Another user (or you)",
                "[--advanced|--adv]": "If this flag is present, it shows more advanced information."
            },
            format: "[--advanced|--adv]"
        });
    }

    pad(n) {
        return n < 10 ? "0" + n : n;
    }

    fmtDate(date) {
        return `${date.getFullYear()}/${this.pad(date.getMonth()+1)}/${this.pad(date.getDate())} ${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}`
    }

    async run(msg, { member }) {
        const e = this.client.utils.emojis;
        let user = member.user;
        let desc = stripIndents`<@${user.id}>

        • ${e.user} | Username: **${user.username}**
        ${member.displayName != user.username ? `• ${e.name} | Nickname: **${member.displayName}**\n` : ""}• ${e.numbers} | Discriminator: **${user.discriminator}**
        • ${e.calendar} | On Discord since **${this.fmtDate(user.createdAt)}**
        • ${e.server} | ${member.joinedTimestamp < (member.guild.createdTimestamp + 5000) ? "Created" : "Joined"} this server at **${this.fmtDate(member.joinedAt)}**
        `;
        if (member.premiumSince)
            desc += `\n• ${e.boost} | Nitro Boosting since **${this.fmtDate(member.premiumSince)}**`
        if (user.bot)
            desc += `\n• ${e.bot} | Is a bot`
        if (user.presence.clientStatus && user.presence.clientStatus.mobile)
            desc += `\n• ${e.mobile} | Is on Mobile`


        let embed = this.client.utils.embed()
            .setTitle(e.user + " User Info")
            .setDescription(desc)
            .setAuthor(user.tag, user.displayAvatarURL())
            .setThumbnail(user.displayAvatarURL())
            .setColor(member.displayColor)
            .setFullFooter("ID: " + user.id);
            
        let act = "Not playing anything and no custom status set."
        if (user.presence.activities[0]) {
            let activity = user.presence.activities[0];
            if (activity.state) {
                act = `${activity.emoji} ${activity.state}`;
            } else act = `${activity.name}`
        }

        let verboseStatus = st => {
            if (st == "dnd")
                return "Do not disturb";
            
            return st[0].toUpperCase() + st.substr(1).toLowerCase()
        }


        let roles = member.roles.cache.filter(r => r.id != r.guild.id).sort((r1, r2) => r2.comparePositionTo(r1)).map(r => `<@&${r.id}>`).join(", ") || "None";

        embed
            .addField(e.game + " Activity", act)
            .addField(e.invisible + " Status", e[user.presence.status] + " " + verboseStatus(user.presence.status))
            .addField(e.users + " Role" + (roles.split(",").length == 1 ? "" : "s"), roles);

        if (["adv", "advanced"].some(flag => msg.flags[flag])) {
            embed.addField(e.lock + " Permissions", member.permissions.toArray().map(p => permissions[p]).join("\n").split("\n\n\n").join("\n\n"));
            if (member.lastMessage && msg.member.level.level > 1) {
                embed.addField(e.message + " Last Message", `${member.lastMessage}\n_In <#${member.lastMessageChannelID}>_`)
            }
        }

        msg.channel.send(embed);
    }
};