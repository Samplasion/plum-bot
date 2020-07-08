// @ts-ignore
const { Command, CommandoClient, CommandMessage, ArgumentCollectorResult } = require('discord.js-commando');
// @ts-ignore
const { Message } = require('discord.js');
// @ts-ignore
const CommandError = require("./CommandError");
// @ts-ignore
const Embed = require("./Embed");

module.exports = class PlumCommand extends Command {
    /**
     * @property {CommandoClient} client
     */

    /**
     * @param {CommandoClient} client The client that instantiated the command.
     * @param {*} options Any option for the command is defined here.
     */
    constructor(client, options) {
        super(client, options);

        this.permLevel = options.permLevel || 1;
        if (this.ownerOnly) this.permLevel = 10;
        if (this.permLevel == 10) this.ownerOnly = true;

        this.premium = false;
    }

    /**
     * Returns a string or `false` if the user doesn't have permission to run this command.
     * @param {Message} msg The message that called this command.
     */
    hasPermission(msg) {
        let perm = msg.guild ?
            msg.member.level :
            msg.author.level
        let hasPerm = perm.level >= this.permLevel;
        // @ts-ignore
        let min = this.client.permissionLevels.filter(i => i.level == this.permLevel)[0];
        if (!hasPerm) return `you don't have the permission to run this command. The minumim permission is: **${min.name}** [${min.level}]`;
        return hasPerm;
    }

    get[Symbol.toStringTag]() {
        return "Command"
    }

    /**
     * Called when the command produces an error while running
     * @param {Error} err - Error that was thrown
     * @param {CommandMessage} message - Command message that the command is running from (see {@link Command#run})
     * @param {Object|string|string[]} args - Arguments for the command (see {@link Command#run})
     * @param {boolean} fromPattern - Whether the args are pattern matches (see {@link Command#run})
     * @param {?ArgumentCollectorResult} result - Result from obtaining the arguments from the collector
     * (if applicable - see {@link Command#run})
     * @returns {Message|Message[]|undefined}
     */
    onError(err, message, args, fromPattern, result) { // eslint-disable-line no-unused-vars
        // super.onError(err, message, args, fromPattern, result);
        let error = new CommandError(err, message);
        console.log(error instanceof CommandError, error.name)
        if (error instanceof CommandError) {
            let e = this.client.utils.emojis;
            let embed = new Embed(this.client)
                .setTitle("Uncaught exception in code")
                .setColor("RED")
                .setDescription(`${"```js"}\n${error.ogError.stack}${"```"}`)
                .addFields(
                { name: e.message + " Message",  value: error.msg.content,    inline: true },
                { name: e.user    + " Author",   value: error.msg.author.tag, inline: true },
                { name: e.id      + " Error ID", value: error.msg.id                       },
                );
            this.client.channels.cache.get(this.client.utils.errors.errorID).send(embed);
        }
        console.error(error.ogError);
        this.client.utils.sendErrMsg(message, `There was an error. The developers have already received the report, though you can speed the `
                         + `fix if you send them this Error ID: \`${error.msg.id}\` in this server: ${this.client.options.invite}`);
    }
}