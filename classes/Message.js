const {
    Structures, DMChannel
} = require('discord.js');
const {
    findType
} = require('../settings/index.js');
const db = require('../utils/database.js');
const PlumClient = require("./Client");
const PlumTextChannel = require("./TextChannel");

// This extends Discord's native Guild class with our own methods and properties
module.exports = Structures.extend("Message", Message => class extends Message {
    /**
     * @param {PlumClient} client 
     * @param {any} data
     * @param {DMChannel | PlumTextChannel} channel
     */
    constructor(client, data, channel) {
        super(client, data, channel);

        this.channel = channel;
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

    /**
     * This method does...
     *
     * @method
     * @name edit
     * @param {...*} args Whatever this is.
     * @returns {PlumMessage} Description of return value.
     */
});
