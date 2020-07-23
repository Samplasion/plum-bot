const Command = require('./../../classes/Command.js');

module.exports = class WarnCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'warn',
            aliases: [],
            group: 'moderation',
            memberName: 'warn',
            description: "Adds an infraction to the user's list.",
            examples: [
                "warn @User stop spamming",
                "warn @User --list",
                "warn @User --edit 1",
                "warn @User --delete 1",
                "warn @User --clear"
            ],
            args: [
               {
                   key: "user",
                   type: "user",
                   prompt: "",
               },
               {
                   key: "text",
                   type: "string",
                   prompt: "",
                   default: "",
               },
            ],
            format: "<user> (reason|--list|--edit <infraction ID>|--delete <infraction ID>|--clear) [--no-dm-user|--nodm]",
            permLevel: 2
        });
    }

    async run(msg, { user: user_, text }) {
        let guild = msg.guild;
        let ext = false;
        if (msg.flags.guild && typeof msg.flags.guild == "string" && msg.author.level.level >= 9) {
            if (this.client.guilds.cache.get(msg.flags.guild)) {
                ext = true;
                guild = this.client.guilds.cache.get(msg.flags.guild);
            } else return msg.error("That guild doesn't exist in my cache.");
        }

        let user = await guild.members.fetch(user_.id);
        if (!user)
            return msg.error(`${user_.tag} is not in ${ext ? "this" : "that"} server`);

        if (msg.flags.list) {
            return this.list(msg, user);
        } else if (msg.flags.edit) {
            if (isNaN(text.trim()) || parseInt(text.trim()) < 0)
                return msg.error("The index must be a number greater than 0.");
            return this.edit(msg, user, parseInt(text.trim()));
        } else if (msg.flags.clear) {
            return this.clear(msg, user);
        } else return this.warn(msg, user, text || "No reason specified.");
    }

    async warn(msg, member, reason) {
        if (member.level.level >= msg.member.level.level)
            return msg.error("You can't warn a fellow staff member!");

        let id = member.warns.add(reason, msg.author.id);

        let warnEmbed = this.client.utils.embed()
            .setTitle("Warning")
            .setDescription(`You've been warned in ${msg.guild.name} for the following reason:\n\n${reason}`)
            .setColor(0)
            .setFullFooter(`This action was taken by the ${msg.guild.name} Staff, and not by the Plum Bot staff`);

        if (!msg.flag("no-dm-user", "nodm"))
            member.user.send(warnEmbed);

        let em = this.client.utils.emojis;
        let e = this.client.utils.embed()
            .setTitle("User Warned")
            .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(0xf1c400)
            .addField(em.user + " User", `**${member.user.tag}** [${member.user.id}]`)
            .addField(`${this.client.utils.emojis.moderator}Moderator`, `**${msg.author.tag}** [${msg.author.id}]`)
            .addField(em.message + " Reason", `${reason}`)
            .addField(`${em.id} Infraction ID`, id);
        
        msg.guild.log(e);
        
        if (id != undefined && id != null)
            return msg.ok(`${member.user.tag} was warned! Infraction ID: \`${id}\`.`);
        else
            return msg.error("There has been an unknown error.");
    }

    async list(msg, member) {
        let raw = member.warns.data;

        if (!raw.length)
            return msg.info(`${member.user.tag} has no infractions.`);

        let embeds = [];
        let pages = Math.ceil(raw.length / 10);
        let e = this.client.utils.emojis;
        for (let i = 0; i < pages; i++) {
            let embed = this.client.utils.embed()
                .setTitle(`${e.moderator} ${member.user.tag}'s warns`)
                .setDescription(`Page ${i+1} of ${pages}`);

            for (let warn of raw.slice(i * 10, i * 10 + 10)) {
                let issuer = "N/A";
                if (warn.issuer) {
                    let user = await this.client.users.fetch(warn.issuer);
                    issuer = user.tag;
                }
                embed.addField(`\`${warn.id}\`. Added ${warn.issueDate ? this.fmtDate(new Date(warn.issueDate)) : "N/A"}` +  (warn.lastEditDate ? ` (edited ${this.fmtDate(new Date(warn.lastEditDate))})` : "") + ` by ${issuer}`, warn.reason);
            }

            embeds.push(embed);
        }
        
        return this.pagination(msg, embeds);
    }

    pad(n) {
        return n < 10 ? "0" + n : n;
    }

    fmtDate(date) {
        return `${date.getFullYear()}/${this.pad(date.getMonth()+1)}/${this.pad(date.getDate())} ${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}`
    }

    async edit(msg, member, id) {
        if (!member.warns.has(id))
            return msg.error(`An infraction with ID \`${id}\` doesn't exist!`);

        let newReason = await msg.member.question(msg.channel, `Enter the new reason below, or alternatively type \`cancel\` to cancel the operation. You can use the \`{{old}}\` variable to insert the current reason.`);
        if (!newReason || newReason.toLowerCase().trim() == "cancel")
            return msg.info("Action canceled.");

        let oldReason = member.warns.get(id).reason;
        newReason = newReason.split("{{old}}").join(oldReason);

        member.warns.edit(id, newReason);

        return msg.ok("Infraction edited!");
    }

    async clear(msg, member) {
        let ask;
        try {
            ask = await msg.member.ask(msg.channel, `Are you sure you want to clear ${member.user.tag}'s infractions?`);
        } catch (e) {
            console.error(e);
            return msg.error("You are already being asked something. Reply to that and retry.");
        }
        if (ask) {
            member.warns.clear();
            return msg.ok("Infractions cleared.");
        } else return msg.info("Action cancelled.");
    }
};