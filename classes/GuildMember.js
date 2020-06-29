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
      get data() {
        return client.points.get(`${user.id}-${guild.id}`) || this.setDefault();
      },
      ensure: () => {
        client.points.ensure(`${user.id}-${guild.id}`, {
          userID: user.id,
          guildID: guild.id,
          points: 0,
          level: 1
        })
      },
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

				client.points.set(`${user.id}-${guild.id}`, currentSettings || defaultSettings);
        return currentSettings || defaultSettings;
			},
      check: () => {
        let data = this.data;
        let curLevel = data.level;
        new level = 
      },
			award() {
				let curPoints = this.data.points;
        client.points.set(`${user.id}-${guild.id}`);
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
