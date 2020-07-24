const { Structures } = require('discord.js');
const PlumCommandFormatError = require("./PlumCommandFormatError");
const { oneLine } = require("common-tags");
const { FriendlyError } = require("discord.js-commando");

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

        this.flags_ = {};
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
            str += `${emoji} | ${obj.message}\n`;
        }

        return this.channel.send(str.trim());
    }

    react(string) {
        if (typeof string == "string") {
            return super.react(string.replace(">", ""));
        } else return super.react(string);
    }

    async run() { // eslint-disable-line complexity
        this.parseFlags(this.argString);
        // Obtain the member if we don't have it
        if(this.channel.type === 'text' && !this.guild.members.cache.has(this.author.id) && !this.webhookID) {
            this.member = await this.guild.members.fetch(this.author);
        }

        // Obtain the member for the ClientUser if it doesn't already exist
        if(this.channel.type === 'text' && !this.guild.members.cache.has(this.client.user.id)) {
            await this.guild.members.fetch(this.client.user.id);
        }

        // Make sure the command is usable in this context
        if(this.command.guildOnly && !this.guild) {
            /**
                * Emitted when a command is prevented from running
                * @event CommandoClient#commandBlock
                * @param {CommandoMessage} message - Command message that the command is running from
                * @param {string} reason - Reason that the command was blocked
                * (built-in reasons are `guildOnly`, `nsfw`, `permission`, `throttling`, and `clientPermissions`)
                * @param {Object} [data] - Additional data associated with the block. Built-in reason data properties:
                * - guildOnly: none
                * - nsfw: none
                * - permission: `response` ({@link string}) to send
                * - throttling: `throttle` ({@link Object}), `remaining` ({@link number}) time in seconds
                * - clientPermissions: `missing` ({@link Array}<{@link string}>) permission names
                */
            this.client.emit('commandBlock', this, 'guildOnly');
            return this.command.onBlock(this, 'guildOnly');
        }

        // Ensure the channel is a NSFW one if required
        if(this.command.nsfw && !this.channel.nsfw) {
            this.client.emit('commandBlock', this, 'nsfw');
            return this.command.onBlock(this, 'nsfw');
        }

        // Ensure the user has permission to use the command
        const hasPermission = this.command.hasPermission(this);
        if(!hasPermission || typeof hasPermission === 'string') {
            const data = { response: typeof hasPermission === 'string' ? hasPermission : undefined };
            this.client.emit('commandBlock', this, 'permission', data);
            return this.command.onBlock(this, 'permission', data);
        }

        // Ensure the client user has the required permissions
        if(this.channel.type === 'text' && this.command.clientPermissions) {
            const missing = this.channel.permissionsFor(this.client.user).missing(this.command.clientPermissions);
            if(missing.length > 0) {
                const data = { missing };
                this.client.emit('commandBlock', this, 'clientPermissions', data);
                return this.command.onBlock(this, 'clientPermissions', data);
            }
        }

        // Throttle the command
        const throttle = this.command.throttle(this.author.id);
        if(throttle && throttle.usages + 1 > this.command.throttling.usages) {
            const remaining = (throttle.start + (this.command.throttling.duration * 1000) - Date.now()) / 1000;
            const data = { throttle, remaining };
            this.client.emit('commandBlock', this, 'throttling', data);
            return this.command.onBlock(this, 'throttling', data);
        }

        if (this.flags_.help) {
            return this.client.registry.commands.get("help").run(this, { command: this.command.name })
        }

        // Figure out the command arguments
        let args = this.patternMatches;
        let collResult = null;
        if(!args && this.command.argsCollector) {
            const collArgs = this.command.argsCollector.args;
            const count = collArgs[collArgs.length - 1].infinite ? Infinity : collArgs.length;
            const provided = this.constructor.parseArgs(this.argString.trim(), count, this.command.argsSingleQuotes);

            collResult = await this.command.argsCollector.obtain(this, provided);
            if(collResult.cancelled) {
                if(collResult.prompts.length === 0) {
                    const err = new PlumCommandFormatError(this);
                    return this.combine(err.messages);
                }
                /**
                    * Emitted when a command is cancelled (either by typing 'cancel' or not responding in time)
                    * @event CommandoClient#commandCancel
                    * @param {Command} command - Command that was cancelled
                    * @param {string} reason - Reason for the command being cancelled
                    * @param {CommandoMessage} message - Command message that the command ran from (see {@link Command#run})
                    * @param {?ArgumentCollectorResult} result - Result from obtaining the arguments from the collector
                    * (if applicable - see {@link Command#run})
                    */
                // this.client.emit('commandCancel', this.command, collResult.cancelled, this, collResult);
                // return this.reply('Cancelled command.');
            }
            args = collResult.values;
        }
        if(!args) args = this.parseArgs();
        const fromPattern = Boolean(this.patternMatches);

        // Run the command
        if(throttle) throttle.usages++;
        const typingCount = this.channel.typingCount;
        try {
            this.client.emit('debug', `Running command ${this.command.groupID}:${this.command.memberName}.`);
            const promise = this.command.run(this, args, fromPattern, collResult);
            /**
                * Emitted when running a command
                * @event CommandoClient#commandRun
                * @param {Command} command - Command that is being run
                * @param {Promise} promise - Promise for the command result
                * @param {CommandoMessage} message - Command message that the command is running from (see {@link Command#run})
                * @param {Object|string|string[]} args - Arguments for the command (see {@link Command#run})
                * @param {boolean} fromPattern - Whether the args are pattern matches (see {@link Command#run})
                * @param {?ArgumentCollectorResult} result - Result from obtaining the arguments from the collector
                * (if applicable - see {@link Command#run})
                */
            this.client.emit('commandRun', this.command, promise, this, args, fromPattern, collResult);
            const retVal = await promise;
            if(!(retVal instanceof Message || retVal instanceof Array || retVal === null || retVal === undefined)) {
                throw new TypeError(oneLine`
                    Command ${this.command.name}'s run() resolved with an unknown type
                    (${retVal !== null ? retVal && retVal.constructor ? retVal.constructor.name : typeof retVal : null}).
                    Command run methods must return a Promise that resolve with a Message, Array of Messages, or null/undefined.
                `);
            }
            return retVal;
        } catch(err) {
            /**
                * Emitted when a command produces an error while running
                * @event CommandoClient#commandError
                * @param {Command} command - Command that produced an error
                * @param {Error} err - Error that was thrown
                * @param {CommandoMessage} message - Command message that the command is running from (see {@link Command#run})
                * @param {Object|string|string[]} args - Arguments for the command (see {@link Command#run})
                * @param {boolean} fromPattern - Whether the args are pattern matches (see {@link Command#run})
                * @param {?ArgumentCollectorResult} result - Result from obtaining the arguments from the collector
                * (if applicable - see {@link Command#run})
                */
            this.client.emit('commandError', this.command, err, this, args, fromPattern, collResult);
            if(this.channel.typingCount > typingCount) this.channel.stopTyping();
            if(err instanceof FriendlyError) {
                return this.reply(err.message);
            } else {
                return this.command.onError(err, this, args, fromPattern, collResult);
            }
        }
    }

    static parseArgs(argString, argCount, allowSingleQuote = true) {
        let result = super.parseArgs(argString.replace(/(?:^|\s)--[^\s=]+(?:=(?<!(?:--))(?:"([^"]*)"|[^\s]*))?/g, ""), argCount, allowSingleQuote);
        // result = result.map(r => {
        //     console.log(r);
        //     let res = r.replace(/(?:^|\s)--[^\s=]+(?:=(?<!(?:--))(?:"([^"]*)"|[^\s]*))?/g, "").trim();
        //     console.log(res);
        //     return res;
        // })//.map(res => res.filter(r => !(.test(r) && r.length > 2))).map(res => res.join(" "));
        console.log(result);
        return result;
    }

    parseFlags(argString) {
        let split = argString.match(/(?:^|\s)--[^\s=]+(?:=(?<!(?:--))(?:"([^"]*)"|[^\s]*))?/g);
        console.log(split);
        let flags = {};
        // Shorthand for "if (split) { split.forEach(...); }".
        split && split.forEach(arg => {
            arg = arg.trim();
            if (!arg.startsWith("--")) return;
            let re = /(?<!(?:--))("|')([^]*)\1$/g;

            let name = arg.substr(2);
            if (!name || name == "=")
                return;
            name = name.split("=")[0].toLowerCase();

            let match;
            // eslint-disable-next-line no-cond-assign
            if (match = re.exec(arg))
                flags[name] = match[2];
            else if (arg.includes("="))
                flags[name] = arg.split("=")[1];
            else flags[name] = true;
            console.log(flags);
        });
        this.flags_ = flags;
    }

    makeEmbed() {
        let e = this.client.utils.embed();
        if (this.noEmbed) {
            e.textOnly = true;
        }
        return e;
    }

    get noEmbed() {
        return ["no-embed", "noembed"].some(a => this.flags[a]);
    }

    flag(...flags) {
        return flags.some(flag => this.flags[flag]);
    }

    get flags() {
        return this.flags_;
    }

    set flags(s) {}
});
