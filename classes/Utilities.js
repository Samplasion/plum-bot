// eslint-disable-next-line no-unused-vars
const { oneLine } = require('common-tags'), 
    PlumEmbed = require('./Embed'),
    CommandError = require("./CommandError"),
    canvas = require("canvas");
const { re } = require('mathjs');
const phin = require("phin");

class Utilities {
    constructor(client) {
        this.client = client

        this.errors = new Errors(this);(guild) => client.configs.set(guild.id, this.getGuildSettings(guild));
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
            blank: "<:blank:735179373011009536>", // Literally nothing
            asterisk: "*️⃣",
            zodiac: {
                aries: "♈",
                taurus: "♉",
                gemini: "♊",
                cancer: "♋",
                leo: "♌",
                virgo: "♍",
                libra: "♎",
                scorpio: "♏️",
                sagittarius: "♐",
                capricorn: "♑",
                aquarius: "♒",
                pisces: "♓",
            }
        }
    }

    async hastebin(text) {
        let query = new URLSearchParams();
        query.append("data", text);
        
        const { body } = await phin({
            url: `https://hastebin.com/documents`,
            method: "POST",
            data: text,
            parse: "json"
        });
        return `https://hastebin.com/${body.key}`;
    }

    embedSplit(text, name = "\u200b", joiner = "\n", descriptionIncluded = false) {
        return text.split(joiner).reduce((prev, cur) => {
            if (!prev || !prev.length)
                return [ cur ];
            else if (prev[prev.length-1].length + joiner.length + cur.length < 1024) {
                prev[prev.length-1] += joiner + cur;
                return prev;
            }
            prev.push(cur);
            return prev;
        }, []).map((val, idx, arr) => {
            return {
                name: arr.length == 1 ? name : `${name} [${idx+1}/${arr.length}]`,
                value: val
            }
        });
    }

    render({ guild, member }, text) {
        return text
            .split("{{server}}").join(guild.name)
            .split("{{user}}").join(member.displayName)
            .split("{{mention}}").join(`<@${member.user.id}>`)
    }

    leetify(input) {
        input = input.toLowerCase();
        let letters = {
            a: ["4", "/\\", "@", "/-\\", "^", "ä", "ª", "aye", "∂", "Fl", "O"],
            b: ["8", "6", "13", "|3", "ß", "P>", "|:", "!3", "(3", "/3", ")3"],
            c: ["[", "¢", "<", "(", "©", ":copyright:"],
            d: ["|)", "o|", "[)", "I>", "|>", "?", "T)", "/)"],
            e: ["3", "&", "£", "ë", "[-", "€", "ê", "|=-"],
            f: ["4", "|=", "ƒ", "|#", "i=", "ph", "/="],
            g: ["6", "&", "(_+", "9", "C-", "gee", "(γ,"],
            h: ["4", "#", "/-/", "[-]", "]-[", ")-(", "(-)", ":-:", "|~| {=}", "<~>", "|-|", "]~[", "}{ ", "]-[", "?", "}-{"],
            i: ["1", "!", "|", "&", "eye", "3y3", "ï", "][", "[]"],
            j: ["_|", ";", "_/", "</", "(/"],
            k: ["X", "|<", "|{", "]{", "}<", "/< ", "|("],
            l: ["2", "£", "7", "1_", "|", "|_", "#", "l", "i", "\\_"],
            m: ["M", "m", "//.", "|v|", "[V]", "{V}", "|\\/|", "/\\/\\", "(u)", "[]V[]", "(V)", "(\\/)", "/|\\", "Μ", "М", "м", "/V\\,"],
            n: ["//", "^/", "|\\|", "|/|", "/\\/", "[\\]", "", "<\\>", "{\\}", "[]\\[]", "И", "n,/V", "₪"],
            o: ["0", "()", "?p", "[]", "*", "ö"],
            p: ["|^", "|*", "|o", "|º", "|^(o)", "|>", "|", "9", "[]D", "|̊", "|7 |°"],
            q: ["[,]", "(_,)", "()_", "0_", "<|", "O-"],
            r: ["|2", "P\\", "|?", "/2,|^", "lz", "®", ":registered:", "[z", "12", "Я", "2", "|>"],
            s: ["5", "2", "$", "z", "§", "ehs", "es"],
            t: ["7", "+", "-|-", "1", "']['", "|", "†"],
            u: ["(_)", "|_|,|.|", "v", "ü Ü"],
            v: ["\\/", "\\_/", "\\./"],
            w: ["\\/\\/", "vv", "'//", "\\^/", "(n)", "\\V/", "\\//", "\\X/", "\\|/", "\\_|_/", "\\_:_/", "\\x/", "I_l_I", "Ш", "VV"],
            x: ["><", "Ж", "}{", ")(", "×"],
            y: ["'-/", "j", "`/", "\\|", "Ý", "ÿ", "ý", "Ŷ", "ŷ", "Ÿ", "Ϋ", "Υ", "Ψ", "φ", "λ", "Ұ", "ұ", "ў", "ץ ,צ", "-)", "Ч", "¥"],
            z: ["2", "~\\_", "~/_", "7_", "%"]
        };
    
        let max = input.split("").reduce((prev, cur) => {
            return prev * letters[cur].length;
        }, 1);
    
        console.log(input, max);
    
        let n = input.length; 
              
        // Number of permutations is 2^n 
        // let max = 1 << n; 
            
        // Converting string to lower case 
        input = input.toLowerCase(); 
    
        let perms = [];
            
        // Using all subsequences and permuting them
        let rep = {};
        for(let i = 0; i < max; i++) {
            let combination = input.split(""); 
                
            // If j-th bit is set, we convert it to upper case 
            for(let j = 0; j < n; j++) {
                // console.log(combination[j]);
                rep[combination[j]] = rep[combination[j]] || 0;
                rep[combination[j]]++;
    
                if(((i >> j) & 1) == 1) 
                    combination[j] = letters[combination[j]][rep[combination[j]] % letters[combination[j]].length];
            }
    
            perms.push(combination.join(""));
        }
    
        console.log(perms);
    
        return perms;
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

    fmtDate(date) {
        return `${date.getFullYear()}/${this.pad(date.getMonth()+1)}/${this.pad(date.getDate())} ${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}`
    }

    async largestSize(images) {
		let currentimage;

		let height = 0;
		let width = 0;

		if (Array.isArray(images))
			for (var image of images) {
				currentimage = await canvas.loadImage(image);

				if (height < currentimage.height)
					height = currentimage.height;

				if (width < currentimage.width)
					width = currentimage.width;
			}
		else {
			currentimage = await canvas.loadImage(images);

			height = currentimage.height;
			width = currentimage.width;
		}

		return { width, height };
    }
    
    titleCase(string) {
        return string.split(" ").map(str => {
            return str[0].toUpperCase() + str.substr(1);
        }).join(" ");
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
