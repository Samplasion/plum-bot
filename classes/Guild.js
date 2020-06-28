const { Structures } = require('discord.js');
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

				let currentsettings = serverconfig.get(guild.id);
				if (currentsettings) {
					for (var key in defaultSettings) {
						currentsettings[key] = defaultSettings[key];
					}

					return serverconfig.set(guild.id, currentsettings);
				}

				return serverconfig.set(guild.id, defaultSettings);
			},
			get data() {
				let data = serverconfig.get(guild.id) || this.setDefaultSettings();
				return data;
			},
			set: (key, newValue) => {
				let currentsettings = serverconfig.get(guild.id);
				currentsettings[key] = newValue;

				return serverconfig.set(guild.id, currentsettings);
			},
			render: (key) => {
				let data = serverconfig.get(guild.id) || this.setDefaultSettings();
				let value = data[key];

				return findType(key).deserialize(guild.client, { guild }, value);
			},
      fix: () => {
        const def = this.setDefaultSettings();
        if (!guild) return def;
        const returns = {};
        const overrides = this.client.settings.get(guild.id) || {};
        for (const key in def) {
          if (key == "types") returns[key] = def[key] // replace the types, just to be sure it's up-to-date
          else returns[key] = overrides[key] || def[key]; // For every key that's not there, use the default one
        }
        this.client.settings.set(guild.id, returns)
        return returns;
      }
		}
	}
})
