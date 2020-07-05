const { Structures, Permissions } = require('discord.js');
const { findType } = require('../settings/index.js');
const db = require('../utils/database.js');

// This extends Discord's native Guild class with our own methods and properties
module.exports = Structures.extend("Guild", Guild => class extends Guild {
	constructor(...args) {
		super(...args);
		this.DBinit();
	}

	DBinit() {
    const serverconfig = this.client.settings;
		let guild = this;
		this.config = {
			getDefaults: function(blank = false, scan = true) {
				let channels = guild.channels;
				let roles = guild.roles.cache;

				let logchannel = scan ? channels.cache.find(channel => channel.name === "modlogs") : null;
				let welcomechannel = scan ? channels.cache.find(channel => channel.name === "general") : null;
				let starboardchannel = scan ? channels.cache.find(channel => channel.name === "starboard") : null;

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

					serverinfo: []
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
			set: (key, newValue) => {
				let currentsettings = serverconfig.get(guild.id) || this.setDefaultSettings();
				currentsettings[key] = newValue;

				return serverconfig.set(guild.id, currentsettings);
			},
			render: (key) => {
				let data = serverconfig.get(guild.id) || this.setDefaultSettings();
				let value = data[key];

				return findType(key).deserialize(guild.client, { guild }, value);
			},
			fix: function() {
				const def = this.getDefaults();
				if (!guild) return def;
				const returns = {};
				const overrides = this.data || {};
				for (const key in def) {
					if (key == "types") returns[key] = def[key] // replace the types, just to be sure it's up-to-date
					else returns[key] = overrides[key] || def[key]; // For every key that's not there, use the default one
				}
				serverconfig.set(guild.id, returns)
				return returns;
			}
		}
	}

	async updateInfo() {
		if (!this.me.hasPermission("MANAGE_CHANNELS"))
			return;
		
		let lines = this.config.data.serverinfo || [];
		let allow = [
			"VIEW_CHANNEL"
		];
		let deny = [
			"CONNECT"
		];

		let category = this.channels.cache.find(ch => ch.name.toLowerCase() == "server info");
		if (!category) {
			category = await this.channels.create("server info", {
				type: "category",
				position: 0
			});
		}

		let channels = this.channels.cache
			.filter(ch => ch.category && ch.category.id == category.id && ch.type == "voice");

		console.log(channels, channels.length);

		if (channels.size > lines.length) {
			for (let i = 0; i < channels.size - lines.length; i++) {
				await channels.random().delete();
			}
		} else if (channels.size < lines.length) {
			let isZero = channels.size == 0;

			for (let i = 0; i < lines.length + channels.size; i++) {
				await this.channels.create(lines[i], {
					permissionOverwrites: [
						{
							id: this.id, // @everyone
							type: "role",
							allow,
							deny
						}
					],
					type: "voice",
					parent: category
				});
			}

			if (isZero)
				return;
		}

		channels = this.channels.cache
			.filter(ch => ch.category && ch.category.id == category.id && ch.type == "voice");

		channels.array().forEach(async(ch, index) => {
			await ch.setName(lines[index]);
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
})
