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
				return client.reminders.list(user) || [];
			},
			add: (reminder) => {
				return client.reminders.add(user, reminder);
			},
      flush: () => {
        return client.reminders.flush(user);
      },
      clear: () => {
        return client.reminders.clear(user);
      },
      delete: function(index) {
        if (index >= 0 && this.list.map(rem => rem.id).includes(index)) {
          var old = this.list;
          let spliced = old.splice(this.list.map(rem => rem.id).indexOf(index), 1);
          console.log(spliced);
          let id = spliced[0].id;
          clearTimeout(this.client.reminders.raw[user.id][id])
          client.reminders.set(user.id, old);
          return true;
        }
        return false;
      }
		}
	}
  
  get level() {
    return this.client.permissionLevels.filter(i => i.level == (this.client.isOwner(this) ? 10 : 1))[0]
  }
})
