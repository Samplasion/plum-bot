const { Structures } = require('discord.js');
const { findType } = require('../settings/index.js');
const databaseModule = require('../utils/database.js');

// This extends Discord's native Guild class with our own methods and properties
module.exports = Structures.extend("User", User => class extends User {
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
