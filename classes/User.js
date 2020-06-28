const discordJS = require('discord.js');
const { findType } = require('../settings/index.js');
const databaseModule = require('../utils/database.js');

// This extends Discord's native Guild class with our own methods and properties
module.exports = discordJS.Structures.extend("User", User => class extends User {
	constructor(...args) {
		super(...args);
		this.DBinit();
	}

	DBinit() {
    const { reminders } = databaseModule;
		let user = this;
		this.reminders = {
			setDefaultSettings: (blank = false, scan = true) => {

				let defaultSettings = {
					userID: user.id,
          reminders: []
				};

				let currentsettings = reminders.findOne({ userID: user.id });
				if (currentsettings) {
					for (var key in defaultSettings) {
						currentsettings[key] = defaultSettings[key];
					}

					return reminders.update(currentsettings);
				}

				return reminders.insert(defaultSettings);
			},
			get data() {
				let data = databaseModule.serverconfig.findOne({ userID: user.id }) || this.setDefaultSettings();
				return data;
			},
			set: (key, reminder, update=true) => {
				let currentsettings = reminders.findOne({guildID: guild.id});
				currentsettings[key].reminders.push() = newValue;

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
