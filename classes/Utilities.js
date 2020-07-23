// eslint-disable-next-line no-unused-vars
const { oneLine } = require('common-tags'), 
    PlumEmbed = require('./Embed'),
    CommandError = require("./CommandError")

class Utilities {
    constructor(client) {
        this.client = client

        this.errors = new Errors(this);

        this.getGuildSettings = (guild) => {
            const def = client.defaultSettings;
            if (!guild) return def;
            const returns = {};
            const overrides = client.configs.get(guild.id) || {};
            for (const key in def) {
                if (key == "types") returns[key] = def[key] // replace the types, just to be sure it's up-to-date
                else returns[key] = overrides[key] || def[key]; // For every key that's not there, use the default one
            }
            return returns;
        };
        this.getSettings = this.getGuildSettings
        client.configs.ensureSets = (guild) => client.configs.set(guild.id, this.getGuildSettings(guild));
    }

    sendOkMsg(msg, txt) {
        return msg.channel.send(`${this.emojis.ok} | ${txt}`);
    }

    sendErrMsg(msg, txt) {
        return msg.channel.send(`${this.emojis.error} | ${txt}`);
    }

    sendInfoMsg(msg, txt) {
        return msg.channel.send(`${this.emojis.info} | ${txt}`);
    }

    get emojis() {
        return {
            first: "⏪",
            prev: "⬅️",
            stop: "⏹️",
            next: "➡️",
            last: "⏩",
            info: "ℹ️",
            category: "📂",
            user: "👤",
            users: "👥",
            channel: "📑",
            server: "🌐",
            ok: "<:ok:732101916904914964>",
            error: "<:error:732102222867070986>",
            numbers: "🔢",
            id: "🆔",
            lock: "🔒",
            paper: "📃",
            off: "📴",
            reboot: "🔄",
            restart: "🔄", // ALIAS
            message: "📝",
            trash: "🗑️",
            alias: "📑",
            moderator: "👷",
            premium: "🔶",
            music: "🎵",
            game: "🎮",
            name: "📛",
            calendar: "📆",
            bot: "<:bot:734798211276865688>", // [BOT]
            mobile: "📱",
            online: "<:online:734801010811207840>", // o
            idle: "<:idle:734801111147348051>", // o
            dnd: "<:dnd:734801157716836482>", // o
            offline: "<:offline:734801031841710210>", // o
            invisible: "<:invisible:734801082949304472>", // o
            streaming: "<:streaming:734801186829500437>", // o
            boost: "<:boost:734804726566223892>",
            audio: "🔈",
            diamond: "💎",
            blank: "<:blank:735179373011009536>" // Literally nothing
        }
    }

    getErrStr(txt) {
        return `${this.emojis.error} | ${txt}`
    }

    embed() {
        return new PlumEmbed(this.client)
    }

    plural(num, item) {
        if (num == 1) return `${num} ${item}`

        var i = item;

        if (item.substr(-1) == "y")
            i = item.substr(0, item.length - 1) + "ies"
        else if (item.substr(-3) == "tch")
            i += "es"
        else i += "s"

        if (item == "day")
            i = "days";

        return `${num} ${i}`
    }

    // t      = Embed title
    // v      = Embed description
    // fieldArray = Embed fields (eg. [["Title1", "Value1"], ["Title2", "Value2", true]] )
    fastEmbed(t, v, fieldArray, marking = true, icon = "") {
        // List (because of the forEach below)
        if (fieldArray) var fields = fieldArray;

        // Creates the embed
        var logged = this.embed()
            .setTitle(t)
            .setDescription(v)
            .setThumbnail(icon)

        if (!marking) {
            logged
                .setFullFooter("")
                .setAuthor("", "")
        }

        if (fieldArray) {
            // console.log(fields);
            logged.addFields(
                ...(fields.map(([name, value, inline]) => ({
                    name,
                    value,
                    inline
                })))
            )
            // fields.forEach(([title, desc, inline]) => {
            //   logged.addField(title, desc, !!inline)
            // })
        }

        return logged;

        // owners.forEach(owner => this.client.users.cache.get(owner).send(logged))
    }

    async rebootLog(msg) {
        var channel = await this.client.channels.fetch(process.env.REBOOT_ID);
        let e = this.emojis;
        let embed = this.fastEmbed(
            e.reboot + " Reboot",
            "",
            [
                [`${e.user} Initiated by`, `${msg.author.tag} [${msg.author.id}]`]
            ],
            false
        );
        return channel.send(embed);
    }

    async log(...args) {
        var channel = await this.client.channels.fetch(process.env.LOG_ID);
        let embed = this.fastEmbed(...args);
        return channel.send(embed);
    }

    async awaitReply(msg, question, limit = 60000) {
        const filter = m => m.author.id === msg.author.id;
        await msg.channel.send(question);
        try {
            const collected = await msg.channel.awaitMessages(filter, {
                max: 1,
                time: limit,
                errors: ["time"]
            });
            return collected.first().content;
        } catch (e) {
            return false;
        }
    }

    clog(type, item) {
        var itemString = typeof item == "string" ? item : require("util").inspect(item)
        console.log(`[${type}] ${itemString}`)
    }

    isId(str) {
        return /^[0-9]{16,20}$/i.test(str)
    }

    pad(n) {
        return n < 10 ? `0${n}` : `${n}`
    }

    trim(str, lgt) {
        // eslint-disable-next-line no-useless-escape
        return str.replace(new RegExp(`/^(.{${lgt-1}}[^\s]*).*/`), "$1") + (lgt < str.length ? '…' : '')
    }

    oxford(arr) {
        var outStr = "";
        if (arr.length === 1) {
            outStr = arr[0];
        } else if (arr.length === 2) {
            //joins all with "and" but no commas
            //example: "bob and sam"
            outStr = arr.join(' and ');
        } else if (arr.length > 2) {
            //joins all with commas, but last one gets ", and" (oxford comma!)
            //example: "bob, joe, and sam"
            outStr = arr.slice(0, -1).join(', ') + ' and ' + arr.slice(-1);
        }
        return outStr;
    }

    get types() {
        return {
            owners: "array|role",
            admins: "array|role",
            mods: "array|role",
            welcomeMessage: "string",
            leaveMessage: "string"
        }
    }

    remindUser(user, reminder) {
        if (!user) return;
        return user.send(`:bulb: You asked me to remind you ${reminder.text}.`);
    }

    buildMessageURL(...args) {
        var url = "https://discordapp.com/channels";
        args.forEach(arg => url += `/${arg.id}`);
        return url;
    }
}

class Errors {
    constructor(utilities) {
        this.utils = utilities;
        this.errorID = process.env.ERROR_ID;
    }

    async unhandledRejection(err) {
            let embed = this.utils.embed()
                .setTitle("Unhandled Promise rejection in code")
                .setColor("RED")
                .setDescription(`${"```js"}\n${err.stack}${"```"}`)
    
    if (err instanceof CommandError) {
      embed.addFields(
          [this.utils.emojis.message + "Message", err.msg.cleanContent],
          [this.utils.emojis.user + "Author", err.msg.author.tag]
      )
    } 
    
    this.utils.client.channels.cache.get(this.errorID).send(embed);
  }
    
  async uncaughtException(err) {
    let embed = this.utils.embed()
    .setTitle("Uncaught exception in code")
    .setColor("RED")
    .setDescription(`${"```js"}${err.toString()}${"```"}`)
    if (err instanceof CommandError) {
      embed.addFields(
        [this.utils.emojis.message + "Message", err.msg.cleanContent],
        [this.utils.emojis.user + "Author", err.msg.author.tag]
      )
    }
    this.utils.client.channels.cache.get(this.errorID).send(embed);
  }
}

module.exports = Utilities
