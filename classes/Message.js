const {
    Structures, DMChannel
} = require('discord.js');
const {
    findType
} = require('../settings/index.js');
const db = require('../utils/database.js');
const PlumClient = require("./Client");
const PlumTextChannel = require("./TextChannel");
const PlumGuild = require("./Guild");

// This extends Discord's native Guild class with our own methods and properties
module.exports = Structures.extend("Message", Message => class PlumMessage extends Message {
    /**
     * @param {PlumClient} client 
     * @param {any} data
     * @param {DMChannel | PlumTextChannel} channel
     */
    constructor(client, data, channel) {
        super(client, data, channel);

        this.channel = channel;

        /** @type {PlumClient} */
        this.client;
        /** @type {PlumGuild?} */
        this.guild;
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
     * Sends an info message in the current channel.
     * @param {string} text The text to send
     */
    info(text) {
        return this.client.utils.sendInfoMsg(this, text);
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
