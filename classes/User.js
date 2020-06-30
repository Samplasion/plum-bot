const { Structures } = require('discord.js');
const { findType } = require('../settings/index.js');
const databaseModule = require('../utils/database.js');

// This extends Discord's native Guild class with our own methods and properties
module.exports = Structures.extend("User", User => class extends User {
	constructor(...args) {
		super(...args);
    
    let client = this.client;
    let user = this;
    
    this.reminders = {
			get list() {
				return client.reminders.list(user);
			},
			add: (reminder) => {
				return client.reminders.add(user, reminder);
			},
      flush: () => {
        return client.reminders.flush(user);
      },
      clear: () => {
        return client.reminders.clear(user);
      }
		}
	}
})
