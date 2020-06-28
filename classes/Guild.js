const discordJS = require('discord.js');
const { findType } = require('../settings/index.js');
const databaseModule = require('../utils/database.js');

// This extends Discord's native Guild class with our own methods and properties
module.exports = discordJS.Structures.extend("Guild", Guild => class extends Guild {
	constructor(...args) {
		super(...args);
		this.DBinit();
	}

	DBinit() {
    const { serverconfig } = databaseModule;
		let guild = this;
		this.config = {
			setDefaultSettings: (blank = false, scan = true) => {
				let channels = guild.channels;

				let logchannel = scan ? channels.cache.find(channel => channel.name === "discord-logs") : null;
				let welcomechannel = scan ? channels.cache.find(channel => channel.name === "general") : null;
				let starboardchannel = scan ? channels.cache.find(channel => channel.name === "starboard") : null;
				let mutedrole = scan ? guild.roles.cache.find(role => role.name === "Muted") : null;

				let defaultSettings = {
					guildID: guild.id,
					logchan: logchannel ? logchannel.id : '',
					welcomechan: welcomechannel ? welcomechannel.id : '',
					welcomemessage: !blank ? ["Welcome {{user}} to {{server}}! Enjoy your stay"] : [],
					leavemessage: !blank ? ["Goodbye {{user}}! You'll be missed"] : [],
					mutedrole: mutedrole ? mutedrole.id : '',
				};

				let currentsettings = serverconfig.findOne({guildID: guild.id});
				if (currentsettings) {
					for (var key in defaultSettings) {
						currentsettings[key] = defaultSettings[key];
					}

					return serverconfig.update(currentsettings);
				}

				return serverconfig.insert(defaultSettings);
			},
			get data() {
				let data = databaseModule.serverconfig.findOne({ guildID: guild.id }) || this.setDefaultSettings();
				return data;
			},
			set: (key, newValue, update=true) => {
				let currentsettings = serverconfig.findOne({guildID: guild.id});
				currentsettings[key] = newValue;

				if (update)
					return serverconfig.update(currentsettings);
			},
			render: (key) => {
				let data = serverconfig.findOne({ guildID: guild.id }) || this.setDefaultSettings();
				let value = data[key];

				return findType(key).deserialize(guild.client, { guild }, value);
			}
		}
	}
})
