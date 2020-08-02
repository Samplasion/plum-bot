// @ts-check
const { Structures } = require('discord.js');
const db = require('../utils/database.js');
const PlumEmbed = require("./Embed");

// This extends Discord's native Guild class with our own methods and properties
module.exports = Structures.extend("NewsChannel", NewsChannel => class extends NewsChannel {
	constructor(...args) {
        super(...args);
        
        /** @type {Set<string>} */
        this.paginations = new Set();
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

    async fetchMessages(limit = 500) {
        const sum_messages = [];
        let last_id;
    
        while (true) {
            const options = { limit: 100 };
            if (last_id) {
                options.before = last_id;
            }
    
            const messages = await this.messages.fetch(options);
            sum_messages.push(...messages.array());
            
            if (!messages.last())
                break;
            
            last_id = messages.last().id;
    
            if (messages.size != 100 || sum_messages.length >= limit) {
                break;
            }
        }
    
        return sum_messages;
    }
});
