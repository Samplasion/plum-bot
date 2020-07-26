const Command = require('./../../classes/Command.js');
const { stripIndents } = require("common-tags");

module.exports = class SwearsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'swears',
            aliases: [],
            group: 'moderation',
            memberName: 'swears',
            description: "See which words are prohibited.",
            args: [{
                key: "user",
                type: "member",
                prompt: "",
                default: "all"
            }],
            format: "[user|\"all\"]",
        });
    }

    hasPermission(msg) {
        if (!msg.guild.config.get("hateblock"))
            return "the Anti-swear filter is disabled in this server.";
        return super.hasPermission(msg);
    }

    async run(msg, { user }) {
        if (msg.member.level.level < 2 || user == "all")
            return this.all(msg);
        return this.list(msg, user);
    }

    async list(msg, member) {
        let raw = member.user.swears.data;

        if (!raw.length)
            return msg.info(`${member.user.tag} hasn't sworn so far.`);

        let embeds = [];
        let pages = Math.ceil(raw.length / 10);
        let e = this.client.utils.emojis;
        for (let i = 0; i < pages; i++) {
            let embed = this.client.utils.embed()
                .setTitle(`${e.moderator} ${member.user.tag}'s swears`)
                .setDescription(`Page ${i+1} of ${pages}`);

            for (let swear of raw.slice(i * 5, i * 5 + 5)) {
                let forgiven = "";
                if (swear.forgiven) {
                    forgiven = "\n\n(forgiven";
                    if (msg.guild.resolve(swear.forgivenBy)) {
                        let user = await this.client.users.fetch(swear.forgivenBy);
                        forgiven += ` by ${user.tag}`;
                    }
                    forgiven += ")";
                }
                embed.addField(`\`${swear.id}\`. Caught on ${swear.date ? this.client.utils.fmtDate(new Date(swear.date)) : "N/A"}`, `||${swear.content}||\n\nTriggering word(s): ||${swear.matches.join("||, ||")}||${forgiven}`);
            }

            embeds.push(embed);
        }
        
        return this.pagination(msg, embeds);
    }

    async all(msg) {
        if (!msg.guild.config.get("hatestrings").length)
            return msg.info("No words are prohibited.");

        let words = msg.guild.config.get("hatestrings").map(word => {
            word = word.split("");

            for (let i = 1; i < word.length - 1; i++)
                word[i] = "•";

            return word.join("");
        }).join(", ");

        msg.info(stripIndents`The following words are prohibited in this server:
        ${words}.
        
        If you get caught saying one of these, moderators will be alerted.`);
    }
};