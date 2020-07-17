const { Structures, Permissions } = require('discord.js');
const { findType } = require('../settings/index.js');
const db = require("../utils/database.js");
const tags = db.tags;

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
			get list() {
				return tags.chain().find({ guild: guild.id });
			},
			add(name, text) {
				let all = tags.data;
				let thisTags = all.filter(tag => tag.guild == guild.id);
				let packed = {
					name,
					text,
					guild: guild.id
				};

				tags.insert(packed);
				return this;
			},
			remove(name) {
				let found = tags.chain().find({ name });
				if (found)
					found.remove();
				return this;
			}
		}
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
     *      render: (key: string) => string
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
				// let starboardchannel = scan ? channels.cache.find(channel => channel.name === "starboard") : null;

				let mutedrole = scan ? roles.find(role => role.name === "Muted") : null;
				let owners = [guild.owner.id];
				let admins = scan ? roles.find(role => role.name === "Admin") : [];
				let mods = scan ? roles.find(role => role.name === "Moderator") : [];
				let helpers = scan ? roles.find(role => role.name === "Helper") : [];

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
                    
                    levelupmsgs: true
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
				let data = serverconfig.get(guild.id) || this.setDefaultSettings();
				return data;
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
			fix: function() {
				let def = this.getDefaults();
				if (!guild) return def;
				let returns = {};
				let overrides = this.data || {};
				for (let key in def) {
					if (key == "types") returns[key] = def[key] // replace the types, just to be sure it's up-to-date
					else returns[key] = overrides[key] || def[key]; // For every key that's not there, use the default one
				}
				serverconfig.set(guild.id, returns);
				return returns;
			}
		}
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
        if (!this.config.data.owners) return [];
        return this.members.cache
            .filter(member => member.roles.cache.has(this.config.data.owners))
            .array();
    }

    get isPremium() {
        return this.owners.some(owner => owner.user.isPremium);
    }
})
