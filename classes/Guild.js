const { Structures, Permissions } = require('discord.js');
const { findType } = require('../settings/index.js');
const { stripIndents } = require("common-tags");

/**
 * @typedef SavedGuildQueueEntry
 * 
 * @property {string} name
 * @property {string} id
 * @property {import("../utils/audio").AudioTrack[]} queue
 */

/** 
 * @typedef GuildQueueManager
 * 
 * @property {Object.<string, SavedGuildQueueEntry>} data
 * @property {(object: SavedGuildQueueEntry) => GuildQueueManager} add
 * @property {(id: string) => GuildQueueManager} remove
 */

// This extends Discord's native Guild class with our own methods and properties
module.exports = Structures.extend("Guild", Guild => class PlumGuild extends Guild {
	constructor(...args) {
		super(...args);
		this.DBinit();

        /** @type {PlumClient} */
        this.client;

        let guild = this;

        /** @type {GuildQueueManager} */
        this.queues = {
			get data() {
                return guild.client.queues.ensure(guild.id, {});
            },
            add(object) {
                let data = this.data;
                data[object.id] = object;
                guild.client.queues.set(guild.id, data);
                return this;
            },
            remove(id) {
                let data = this.data;
                delete data[id];
                guild.client.queues.set(guild.id, data);
                return this;
            }
		}

		this.tags = {
            get tags() {
                return require("../utils/database.js").tags;
            },
			get list() {
				return this.tags.data.filter(tag => tag.guild == guild.id);
			},
			add(name, text) {
				// let all = this.tags.data;
				// let thisTags = all.filter(tag => tag.guild == guild.id);
				let packed = {
					name,
					text,
					guild: guild.id
				};

				this.tags.insert(packed);
				return this;
			},
			remove(name) {
				let found = this.tags.chain().find({ name });
				if (found)
					found.remove();
				return this;
			}
        }
        
        this.cachedSwears = [];
    }
    
    /**
     * @typedef GuildConfigData
     * @type {Object.<string, any>}
     */

    /**
     * @typedef GuildConfig
     * @type {{ 
     *      getDefaults: (blank?: boolean, scan?: boolean) => GuildConfigData
     *      setDefaultSettings: (blank?: boolean, scan?: boolean) => GuildConfigData
     *      data: GuildConfigData
     *      set: (key: string, value: any) => GuildConfig
     *      render: (key: string) => string,
     *      get: (key: string) => unknown,
     *      fix: () => Object.<string, any>
     * }}
     */

	DBinit() {
        const serverconfig = this.client.configs;
        let guild = this;
        /** @type GuildConfig */
		this.config = {
			getDefaults: function(blank = false, scan = true) {
				let channels = guild.channels;
				let roles = guild.roles.cache;

				let logchannel = scan ? channels.cache.find(channel => channel.name === "modlogs") : null;
				let welcomechannel = scan ? channels.cache.find(channel => channel.name === "general") : null;
				let starboardchannel = scan ? channels.cache.find(channel => channel.name === "starboard") : null;

				let mutedrole = scan ? roles.find(role => role.name === "Muted") : null;
				let owners = [guild.owner.id];
				let admins = scan ? roles.find(role => role.name === "Admin" || role.permissions.has("ADMINISTRATOR")) : null;
				let mods = scan ? roles.find(role => role.name === "Moderator" || role.permissions.has("MANAGE_MESSAGES")) : null;
				let helpers = scan ? roles.find(role => role.name === "Helper") : null;
				let hatebypass = scan ? roles.find(role => role.name === "Anti-swear Bypass") : null; // This is so specific it's almost guaranteed it never matches

				return {
					guildID: guild.id,

					owners,
					mods,
					admins,

					helpers,

					logchan: logchannel ? logchannel.id : '',

					welcomechan: welcomechannel ? welcomechannel.id : '',
					welcomemessage: !blank ? ["Welcome {{user}} to {{server}}! Enjoy your stay"] : [],
					leavemessage: !blank ? ["Goodbye {{user}}! You'll be missed"] : [],

					mutedrole: mutedrole ? mutedrole.id : '',

					ticketcategory: blank ? '' : "Support tickets",

                    serverinfo: [],
                    
                    levelupmsgs: true,
                    unknowncommand: false,

                    starboardchan: starboardchannel ? starboardchannel.id : null,

                    hateblock: false,
                    hatestrings: [],
                    hateresponse: stripIndents`
                    {{mention}}, you just said a word that can be identified as hate speech.
                    Hate speech is not tolerated in this server.

                    This event has been logged and noted to the server staff. And you
                    also got no points for the message. So maybe next time, you'll think
                    twice before swearing.
                    `.trim(),
                    hatemsgdel: true,
                    hateresend: false,
                    hatebypass
				};
			},
			setDefaultSettings: function(blank = false, scan = true) {
				let defaultSettings = this.getDefaults(blank, scan);

				let currentsettings = serverconfig.get(guild.id);
				if (currentsettings) {
					for (var key in defaultSettings) {
						currentsettings[key] = defaultSettings[key];
					}

					serverconfig.set(guild.id, currentsettings);
                    return currentsettings;
				}

				serverconfig.set(guild.id, defaultSettings);
                return defaultSettings;
			},
			get data() {
                // this.fix(serverconfig.get(guild.id));
				let data = serverconfig.get(guild.id) || this.setDefaultSettings();
				return data;
			},
            get(key) {
                this.fix();
                return findType(key).deserialize(guild.client, { guild }, this.data[key]);
            },
			set(key, newValue) {
				let currentsettings = serverconfig.get(guild.id) || this.setDefaultSettings();
				currentsettings[key] = newValue;

                serverconfig.set(guild.id, currentsettings);
                return this;
			},
			render: (key) => {
				let data = serverconfig.get(guild.id) || this.setDefaultSettings();
				let value = data[key];

				return findType(key).deserialize(guild.client, { guild }, value);
			},
			fix: function(data) {
				let def = this.getDefaults();
				if (!guild) return def;
				let returns = {};
				let overrides = data ? data : (this.data || {});
				for (let key in def) {
					if (key == "types") returns[key] = def[key] // replace the types, just to be sure it's up-to-date
					else returns[key] = overrides[key] || def[key]; // For every key that's not there, use the default one
				}
				serverconfig.set(guild.id, returns);
				return returns;
			}
		}
	}

    get swears() {
        try {
            if (this.config.get("hatestrings")) {
                if (this.config.get("hatestrings").length) {
                    return this.config.get("hatestrings")
                        .map(str => {
                            return str
                                .normalize("NFD") // Splits "è" into "e" + "`" 
                                .replace(/[\u0300-\u036f]/g, "") // Strips diacritics
                                .toLowerCase()
                        })
                        .map(this.swearRegexify);
                } else return []
            } else return []
        } catch {
            return []
        }
    }

    swearRegexify(input) {
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
            n: ["//", "^/", "|\\|", "|/|", "/\\/", "[\\]", "", "<\\>", "{\\}", "[]\\[]", "И", "n", "/V", "₪"],
            o: ["0", "()", "?p", "[]", "*", "ö"],
            p: ["|^", "|*", "|o", "|º", "|^(o)", "|>", "|", "9", "[]D", "|̊", "|7 |°"],
            q: ["[,]", "(_,)", "()_", "0_", "<|", "O-"],
            r: ["|2", "P\\", "|?", "/2", "|^", "lz", "®", ":registered:", "[z", "12", "Я", "2", "|>"],
            s: ["5", "2", "$", "z", "§", "ehs", "es"],
            t: ["7", "+", "-|-", "1", "']['", "|", "†"],
            u: ["(_)", "|_|", "|.|", "v", "ü Ü"],
            v: ["\\/", "\\_/", "\\./"],
            w: ["\\/\\/", "vv", "'//", "\\^/", "(n)", "\\V/", "\\//", "\\X/", "\\|/", "\\_|_/", "\\_:_/", "\\x/", "I_l_I", "Ш", "VV"],
            x: ["><", "Ж", "}{", ")(", "×"],
            y: ["'-/", "j", "`/", "\\|", "Ý", "ÿ", "ý", "Ŷ", "ŷ", "Ÿ", "Ϋ", "Υ", "Ψ", "φ", "λ", "Ұ", "ұ", "ў", "ץ ,צ", "-)", "Ч", "¥"],
            z: ["2", "~\\_", "~/_", "7_", "%"]
        };
    
        let text = input.split("").reduce((prev, cur, idx, arr) => {
            return `${prev}(?:${[cur, ...(letters[cur] || [])].map(letter => {
                return letter.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
            }).join("|")})+` + (arr.length == idx + 1 ? "" : "\\s*");
        }, "");
        let regex = new RegExp(`\\b${text}\\b`, "g");
        
        return regex;
    }

	async updateInfo() {
		if (!this.me.hasPermission("MANAGE_CHANNELS"))
			return;
    
		let guild = this;
		function fmt(str) {
			if (!str) return str;
			let s = str
				.split("{{members}}").join(guild.members.cache.size)
				.split("{{channels}}").join(guild.channels.cache.size);
			return s;
		}
    
		let lines = this.config.data.serverinfo || [];

		let allow = [
			"VIEW_CHANNEL"
		];
		let deny = [
			"CONNECT"
		];

		let category = this.channels.cache.find(ch => ch.name.toLowerCase() == "server info");
		if (!category && lines.length) {
			category = await this.channels.create("server info", {
				type: "category",
				position: 0
			});
		}

		// If there's still no category there's nothing we can do.
		if (!category) {
			return;
		}

		let channels = this.channels.cache
			.filter(ch => ch.parent && ch.parent.id == category.id && ch.type == "voice");

		if (channels.size > lines.length) {
			let arr = channels.array()
			for (let i = 0; i < arr.length - lines.length; i++) {
				await arr[i].delete("Server info line number mismatch");
			}
		} else if (channels.size < lines.length) {
			let isZero = channels.size == 0;

			for (let i = 0; i < lines.length - channels.size; i++) {
				await this.channels.create(fmt(lines[i]), {
					permissionOverwrites: [
						{
							id: this.id, // @everyone
							type: "role",
							allow,
							deny
						},
						{
							id: this.client.user.id,
							type: "member",
							allow: deny.concat(allow),
						}
					],
					type: "voice",
					parent: category
				});
			}

			// Returning because we just created the updated channels
			if (isZero)
				return;
		}

		if (!lines.length) {
			if (category) 
				await category.delete();
			return;
		}

		channels = this.channels.cache
			.filter(ch => ch.parent && ch.parent.id == category.id && ch.type == "voice");

		channels.array().forEach(async(ch, index) => {
			await ch.setName(fmt(lines[index]));
		});

		// for (let line of lines.reverse()) {
		// 	await this.channels.create(line, {
		// 		permissionOverwrites: [
		// 			{
		// 				id: this.id,
		// 				type: "voice",
		// 				allow,
		// 				deny
		// 			}
		// 		],
		// 		position: 0,
		// 		parent: category
		// 	});
		// }
	}
  
	async log(...stuff) {
		let channel = await this.client.channels.fetch(this.config.data.logchan);
		if (channel && channel.send && channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES))
			return channel.send(...stuff);
    }
    
    get queue() {
        try {
            return this.client.audio.active.get(this.id).queue || [];
        } catch (_) {
            return [];
        }
    }

    /** 
     * @returns {GuildMember[]}
     */
    get owners() {
        let arr = [this.owner];
        if (!this.config.data.owners) return arr;
        return arr.concat(this.members.cache
            .filter(member => member.roles.cache.has(this.config.data.owners))
            .array()).filter((el, index, arr) => arr.indexOf(el) == index);
    }

    get isPremium() {
        return this.owners.some(owner => owner.user.isPremium);
    }
})
