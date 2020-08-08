// @ts-check
const { Structures } = require('discord.js');
const db = require('../utils/database.js');
const PlumEmbed = require("./Embed");
const TextChannel = require('./TextChannel.js');

// This extends Discord's native Guild class with our own methods and properties
module.exports = Structures.extend("NewsChannel", NewsChannel => class extends NewsChannel {
	constructor(...args) {
        super(...args);
        
        /** @type {Set<string>} */
        this.paginations = new Set();

        this.fetchMessages = TextChannel.prototype.fetchMessages;
    }
    
    get readable() {
        let me = this.guild.me;
        return this.permissionsFor(me).has("READ_MESSAGE_HISTORY");
    }

	get sendable() {
		let me = this.guild.me;
		return this.permissionsFor(me).has('SEND_MESSAGES');
	}

	get embedable() {
		let me = this.guild.me;
		return this.permissionsFor(me).has('EMBED_LINKS');
    }
});
