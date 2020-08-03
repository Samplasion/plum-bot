// @ts-check
const {
    Structures, DMChannel, TextChannel
} = require('discord.js');
const {
    findType
} = require('../settings/index.js');
const db = require('../utils/database.js');
const PlumEmbed = require("./Embed");

// This extends Discord's native Guild class with our own methods and properties
module.exports = Structures.extend("TextChannel", TextChannel => class PlumTextChannel extends TextChannel {
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

	get webhookPerm() {
        let me = this.guild.me;
        return this.permissionsFor(me).has('MANAGE_WEBHOOKS');
    }
    
    /** @return {Promise<import("discord.js").Webhook>} */
    async getFirstWebhook() {
        let webhooks = await this.fetchWebhooks();
        if (webhooks.size)
            return webhooks.first();
        if (!this.permissionsFor(this.guild.me).has("MANAGE_WEBHOOKS"))
            return null;
        return this.createWebhook("Webhook");
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
