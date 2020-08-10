// @ts-check
const {
    Structures, DMChannel, TextChannel, Collection
} = require('discord.js');
const {
    findType
} = require('../settings/index.js');
const db = require('../utils/database.js');
const Message = require("./Message");

// This extends Discord's native Guild class with our own methods and properties
module.exports = Structures.extend("TextChannel", TextChannel => class PlumTextChannel extends TextChannel {
	constructor(guild, data) {
        super(guild, data);
        
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

    /**
     * @param {{ limit?: number, before?: string, after?: string, around?: string }} options 
     */
    async fetchMessages({ limit = 500 } = { limit: 500 }) {
        const sum_messages = [];
        let last_id;
    
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const options = { limit: 100 };
            if (last_id) {
                // @ts-ignore
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

    /**
     * Returns an array of messages between `from` (inclusive) and `to` (exclusive)
     * @param { import('discord.js').Snowflake } from
     * @param { import('discord.js').Snowflake } to
     */
    async fetchMessagesInRange(from, to) {
        const sum_messages = [];
        let last_id;
    
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const options = { limit: 100, after: from };
            if (last_id) {
                // @ts-ignore
                options.before = last_id;
            }
    
            const messages = await this.messages.fetch(options);
            sum_messages.push(...messages.array());
            
            if (!messages.last())
                break;
            
            last_id = messages.last().id;
            //                          Integer arithmetic with big integers
            if (messages.size != 100 || BigInt(sum_messages[sum_messages.length - 1].id) < BigInt(to)) {
                break;
            }
        }
    
        // The messages are broadly around the limit. Let's tighten them up.
        return sum_messages.filter(message => {
            return BigInt(message.id) <= BigInt(to)
                && BigInt(message.id) >= BigInt(from)
        });
    }

    async fetchMessagesFrom(from, limit) {
        const sum_messages = [];
        let last_id;
    
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const options = { limit: 100, after: from };
            if (last_id) {
                // @ts-ignore
                options.after = last_id;
            }
    
            const messages = await this.messages.fetch(options);
            sum_messages.push(...messages.array());
            
            if (!messages.last())
                break;
            
            last_id = messages.last().id;
            //                          Integer arithmetic with big integers
            if (messages.size != 100 || sum_messages.length > limit) {
                break;
            }
        }
    
        // The messages are broadly around the limit. Let's tighten them up.
        return sum_messages.filter(message => {
            return BigInt(message.id) >= BigInt(from)
        });
    }

    async fetchMessagesTo(limit, to) {
        const sum_messages = [];
        let last_id;
    
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const options = { limit: 100, before: to };
            if (last_id) {
                // @ts-ignore
                options.before = last_id;
            }
    
            const messages = await this.messages.fetch(options);
            sum_messages.push(...messages.array());
            
            if (!messages.last())
                break;
            
            last_id = messages.last().id;
            //                          Integer arithmetic with big integers
            if (messages.size != 100 || sum_messages.length > limit) {
                break;
            }
        }
    
        // The messages are broadly around the limit. Let's tighten them up.
        return sum_messages.filter(message => {
            return BigInt(message.id) <= BigInt(to)
        });
    }
});
