const { Structures } = require('discord.js');
const PlumCommandFormatError = require("./PlumCommandFormatError");
const { oneLine } = require("common-tags");
const { FriendlyError } = require("discord.js-commando");
const { PlumClient } = require('./Client');
const { PlumUser } = require('./User');
const PlumEmbed = require('./Embed');

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
        /** @type {PlumUser} */
        this.author;
        /** @type {import("./Embed")[]} */
        this.embeds;

        this.flags_ = {};

        // Swear stuff
        this.isSwear = false;
        this.swear = [];
    }

    get prefix() {
        return this.guild ? this.guild.commandPrefix : this.client.commandPrefix;
    }

    /**
     * Sends an error message in the current channel.
     * @param {string} text The text to send
     */
    error(text, options) {
        return this.combine([{
            type: "error",
            message: text
        }], options);
    }

    /**
     * Sends an OK message in the current channel.
     * @param {string} text The text to send
     */
    ok(text, options) {
        return this.combine([{
            type: "ok",
            message: text
        }], options);
    }

    /**
     * Sends an info message in the current channel.
     * @param {string} text The text to send
     */
    info(text, options) {
        return this.combine([{
            type: "info",
            message: text
        }], options);
    }

    /**
     * Sends a loading message in the current channel.
     * @param {string} text The text to send
     */
    loading(text, options) {
        return this.combine([{
            type: "loading",
            message: text
        }], options);
    }

    /**
     * Edits this message to an error message in the current channel.
     * @param {string} text The text to send
     */
    editError(text, options) {
        return this.editCombine([{
            type: "error",
            message: text
        }], options);
    }

    /**
     * Edits this message to an OK message in the current channel.
     * @param {string} text The text to send
     */
    editOk(text, options) {
        return this.editCombine([{
            type: "ok",
            message: text
        }], options);
    }

    /**
     * Edits this message to an info message in the current channel.
     * @param {string} text The text to send
     */
    editInfo(text, options) {
        return this.editCombine([{
            type: "info",
            message: text
        }], options);
    }

    /**
     * Edits this message to  a loading message in the current channel.
     * @param {string} text The text to send
     */
    editLoading(text, options) {
        return this.combine([{
            type: "loading",
            message: text
        }], options);
    }

    combine(array, options) {
        let str = "";
        for (let obj of array) {
            let emoji = this.client.utils.emojis[obj.type];
            str += `${emoji} | ${obj.message || obj.value || obj.text}\n`;
        }

        return this.channel.send(str.trim(), options);
    }

    /**
     * @param {({ type: string } & ({ message: string? } | { value: string? } | { text: string? }))[]} array 
     */
    editCombine(array, options) {
        let str = "";
        for (let obj of array) {
            let emoji = this.client.utils.emojis[obj.type];
            str += `${emoji} | ${obj.message || obj.value || obj.text}\n`;
        }

        return this.edit(str.trim(), options);
    }

    react(string) {
        if (typeof string == "string") {
            return super.react(string.replace(">", ""));
        } else return super.react(string);
    }

    async run() {
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
        return result;
    }

    parseFlags(argString) {
        let re = () => /(?:^|\s)--[^\s=]+(?:=(?<!(?:--))(?:"([^"]*)"|[^\s]*))?/g;
        let split = argString.match(re());
        console.log(split);
        /** @type {Object.<string, string | boolean | number | Array<string | boolean | number>>} */
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

            function addFlag(n, c) {
                if (flags[n] && !Array.isArray(flags[n])) {
                    flags[n] = [
                        flags[n], c
                    ]
                } else if (Array.isArray(flags[n]))
                    flags[n].push(c)
                else flags[n] = c;
            }

            let match;
            // eslint-disable-next-line no-cond-assign
            if (match = re.exec(arg)) {
                let f = match[2];
                if (!isNaN(f) && parseInt(f) < Number.MAX_SAFE_INTEGER)
                    f = parseInt(f);
                addFlag(name, f);
            } else if (arg.includes("=")) {
                let f = arg.split("=")[1];
                if (!isNaN(f) && parseInt(f) < Number.MAX_SAFE_INTEGER)
                    f = parseInt(f);
                addFlag(name, f);
            } else addFlag(name, true);
            console.log(flags);
        });
        this.flags_ = flags;
        this.argString = this.argString.replace(re(), "");
    }

    makeEmbed() {
        let e = this.client.utils.embed();
        if (this.noEmbed) {
            e.textOnly = true;
        }
        return e;
    }

    async checkSwears(dry = false) {
        const message = this;
        if (!message.guild)
            return // No DMs

        var cnt = message.content;
        
        const client = this.client;
        
        let getsPoints = true;

        if (message.guild.config.get("hateblock") && (!message.author.bot || dry)) {
            if (message.guild.config.get("hatebypass") &&
                message.member.roles.cache.has(message.guild.config.get("hatebypass").id))
                return;
            
            let arr = message.guild.swears;
            if (arr && arr.length) {
                let s = [];
                arr.forEach(swear => {
                    let c = message.content
                        .normalize("NFD") // Splits "è" into "e" + "`" 
                        .replace(/[\u0300-\u036f]/g, "") // Strips diacritics
                        .replace(/[^\w\s\d]/g, " ")
                        .toLowerCase()
                    if (swear.test(c)) {
                        let match = c.match(swear)[0];
                        s.push(message.content.substr(c.indexOf(match), match.length));
                        getsPoints = false;
                    }
                })
            
                if (!getsPoints) {
                    message.isSwear = true;
                    message.swear = s.flat();
                    
                    let content = message.content// .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    for (let s of message.swear) {
                        let s_ = String.raw`${s.trim()}`;
                        content = content.split(new RegExp((s_).replace("\\", "\\\\"), "i")).join("•".repeat(s.trim().length))
                    }
                    
                    if ((message.guild.config.get("hatemsgdel") || message.guild.config.get("hateresend")) && message.channel.permissionsFor(message.guild.me).has("MANAGE_MESSAGES"))
                        await message.delete();
                    getsPoints = false;
                    if (message.guild.config.get("hateresend")) {
                        let wh = await message.channel.getFirstWebhook();
                        if (wh) {
                            if (!dry) {
                                let content = message.content;
                                for (let s of message.swear) {
                                    content = content.split(new RegExp((String.raw`${s.trim()}`).replace("\\", "\\\\"), "i")).join("•".repeat(s.trim().length))
                                }
                                wh.send(
                                    content,
                                    {
                                        username: message.member.displayName,
                                        avatarURL: message.author.displayAvatarURL(),
                                        embeds: message.embeds
                                    }
                                )
                            }
                        }
                    } else if (message.guild.config.get("hateresponse"))
                        message.channel.send(client.utils.render(message, message.guild.config.get("hateresponse")));

                    let e = client.utils.emojis;
                    let embed = client.utils.embed()
                        .setAuthor(message.author.tag, message.author.displayAvatarURL())
                        .setTitle(`${e.name} Swear`)
                        .setDescription(`Content:\n\n||${message.cleanContent}||\n\nTriggering word(s): ||${message.swear.join("||, ||")}||`)
                        .addField(`${e.channel} Channel`, `<#${message.channel.id}> (#${message.channel.name})`)
                        .addField(`${e.calendar} Caught on`, client.utils.fmtDate(new Date(message.createdTimestamp)))
                        .addField(`${e.id} Message ID`, message.id);
                    await message.guild.log(embed);

                    message.author.swears.add(message);
                }
            }
        }

        if (dry)
            return cnt;
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

    // Doesn't regard for the 2000 char limit
    get text() {
        let content = this.content;
        for (let embed of this.embeds) {
            content += `${content ? "\n\n" : ""}[EMBED]\n${PlumEmbed.textRepresentation(embed, this.client)}`
        }
        content += `${content ? "\n\n" : ""}on ${this.client.utils.fmtDate(new Date(this.createdAt))}`

        return content;
    }
});
