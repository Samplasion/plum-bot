const { Structures } = require('discord.js');
const { findType } = require('../settings/index.js');
const db = require('../utils/database.js');

// This extends Discord's native Guild class with our own methods and properties
module.exports = Structures.extend("Message", Message => class extends Message {
	constructor(...args) {
		super(...args);
	}
  
  get prefix() {
    return this.guild ? this.guild.commandPrefix : this.client.commandPrefix;
  }
})
