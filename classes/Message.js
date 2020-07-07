const {
    Structures
} = require('discord.js');
const {
    findType
} = require('../settings/index.js');
const db = require('../utils/database.js');

// This extends Discord's native Guild class with our own methods and properties
module.exports = Structures.extend("Message", Message => class extends Message {
    constructor(...args) {
        super(...args);
    }

    get prefix() {
        return this.guild ? this.guild.commandPrefix : this.client.commandPrefix;
    }

    /**
     * Sends an error message in the current channel.
     * @param {string} text The text to send
     */
    error(text) {
        return this.client.utils.sendErrMsg(this, text);
    }

    /**
     * Sends an OK message in the current channel.
     * @param {string} text The text to send
     */
    ok(text) {
        return this.client.utils.sendOkMsg(this, text);
    }
})
