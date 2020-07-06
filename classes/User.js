// @ts-expect-error
const { Structures } = require('discord.js');
const { findType } = require('../settings/index.js');
const databaseModule = require('../utils/database.js');

// @ts-expect-error
const { Message, GuildChannel } = require("discord.js");

// This extends Discord's native Guild class with our own methods and properties
// @ts-ignore
module.exports = Structures.extend("User", User => class extends User {

  // @ts-expect-error
	constructor(...args) {
		super(...args);
    
    let client = this.client;
    let user = this;
    
    this.reminders = {
			get list() {
				return client.reminders.list(user) || [];
      },
      /** @param {Object} reminder */
			add: (reminder) => {
				return client.reminders.add(user, reminder);
			},
      flush: () => {
        return client.reminders.flush(user);
      },
      clear: () => {
        return client.reminders.clear(user);
      },
      /** @param {number} index */
      delete: function(index) {
        // @ts-expect-error
        if (index >= 0 && this.list.map(rem => rem.id).includes(index)) {
          var old = this.list;
          // @ts-expect-error
          let spliced = old.splice(this.list.map(rem => rem.id).indexOf(index), 1);
          console.log(spliced);
          let id = spliced[0].id;
          clearTimeout(client.reminders.raw[user.id][id])
          client.reminders.set(user.id, old);
          return true;
        }
        return false;
      }
		}
  }
  
  /**
   * @param {GuildChannel} channel 
   * @param {string} question 
   */
  async ask(channel, question) {
    /**
     * @param {Message} m 
     */
    const filter = m => m.author.id == this.id;
    await channel.send(question);
    try {
      const collected = await channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });
      return ["ok", "yes", "y", "sure", "why not"].includes(collected.first().content.toLowerCase().trim());
    } catch (e) {
      return false;
    }
  }
  
  get level() {
    return this.client.permissionLevels.filter(i => i.level == (this.client.isOwner(this) ? 10 : 1))[0]
  }
})
