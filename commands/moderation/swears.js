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
            details: "Usage of the arguments is restricted to those with permission level greater than or equal to 2",
            args: [
                {
                    key: "user",
                    type: "member",
                    prompt: "",
                    default: "all"
                },
                {
                    key: "other",
                    type: "string",
                    prompt: "",
                    default: ""
                }
            ],
            format: "[user|\"all\"] [--forgive=\"swear id\"]",
        });

        this.formatExplanation = {
            '[user|"all"]': "The user to see the swears of (get a list of the swears if \"all\")",
            '[--forgive="swear id"]': "If it's present and it's a number, forgives the swear with ID `swear id`"
        }
    }

    hasPermission(msg) {
        if (!msg.guild.config.get("hateblock"))
            return "the Anti-swear filter is disabled in this server.";
        return super.hasPermission(msg);
    }

    async run(msg, { user, other }) {
        if (msg.member.level.level < 2 || user == "all" || user == "list")
            return this.all(msg);
        if (msg.flag("forgive")) {
            if (isNaN(other) || parseInt(other) < 0)
                return msg.error("The index should be a number greater than or equal to 0.");
            return this.forgive(msg, user, parseInt(other));
        }
        return this.list(msg, user);
    }

    async forgive(msg, member, index) {
        let raw = member.user.swears.data;

        if (!raw.map(s => s.id).includes(index))
            return msg.error("That index isn't a valid swear!");

        member.user.swears.forgive(msg, index);

        return msg.ok(`The swear with index \`${index}\` was forgiven.`);
    }

    async list(msg, member) {
        let raw = member.user.swears.data;

        if (!raw.length)
            return msg.info(`${member.user.tag} hasn't sworn so far.`);

        let embeds = [];
        let pages = Math.ceil(raw.length / 5);
        let e = this.client.utils.emojis;
        for (let i = 0; i < pages; i++) {
            let embed = this.client.utils.embed()
                .setTitle(`${e.moderator} ${member.user.tag}'s swears`)
                .setDescription(`Page ${i+1} of ${pages}`);

            for (let swear of raw.slice(i * 5, i * 5 + 5)) {
                let forgiven = "";
                if (swear.forgiven) {
                    forgiven = "\n\n(forgiven";
                    if (msg.guild.members.resolve(swear.forgivenBy)) {
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