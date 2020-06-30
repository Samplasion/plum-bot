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
			get list() {
				return this.client.reminders.list(this);
			},
			add: (reminder) => {
				return this.client.reminders.add(this, reminder);
			},
      flush: () => {
        return this.client.reminders.flush(this);
      },
      clear: () => {
        return this.client.reminders.clear(this);
      }
		}
	}
})
