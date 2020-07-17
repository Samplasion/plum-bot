const { Structures } = require('discord.js');

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

    combine(array) {
        let str = "";
        for (let obj of array) {
            let emoji = this.client.utils.emojis[obj.type];
            str += `${emoji} | ${obj.message}`;
        }

        return this.channel.send(str.trim());
    }

    react(string) {
        if (typeof string == "string") {
            return super.react(string.replace(">", ""));
        } else return super.react(string);
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
