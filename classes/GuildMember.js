const { Structures } = require('discord.js');
const { findType } = require('../settings/index.js');
const databaseModule = require('../utils/database.js');

// This extends Discord's native GuildMember class with our own methods and properties
module.exports = Structures.extend("GuildMember", GuildMember => class extends GuildMember {
	constructor(...args) {
		super(...args);
		this.DBinit();
	}

	DBinit() {
		let user = this;
		let guild = this.guild;
    let client = this.client;
		this.points = {
			setDefault: () => {

				let defaultSettings = {
					userID: user.id,
          guildID: guild.id,
          points: 0,
          level: 1
				};

				let currentSettings = client.points.get();
				if (currentSettings) {
					for (var key in defaultSettings) {
						currentSettings[key] = defaultSettings[key];
					}
				}

				return client.points.set(`${user.id}-${guild.id}`, currentSettings || defaultSettings);
			},
			get list() {
				let data = reminders.findOne({ userID: user.id }) || this.setDefaultSettings();
        // console.log(data, reminders.data, user.id);
				return data.reminders;
			},
			add: (reminder) => {
				let currentsettings = reminders.findOne({ userID: user.id });
				currentsettings.reminders.push(reminder);
        
        // console.log(currentsettings);

				/*console.log(*/reminders.update(currentsettings)//);
			},
      flush: () => {
        let currentsettings = reminders.findOne({ userID: user.id })
        currentsettings.reminders = currentsettings.reminders.filter(rem => {
          return rem.date > Date.now();
        });
        return reminders.update(currentsettings);
      }
		}
	}
})
