/* eslint-disable no-case-declarations */
// @ts-ignore
const { Command, util: { permissions } } = require('discord.js-commando');
const { stripIndents, oneLine } = require("common-tags");
// @ts-ignore
// @ts-ignore
const CommandError = require("./CommandError");
// @ts-ignore
const Embed = require("./Embed");
const ArgumentCollector = require("./ArgumentCollector");

module.exports = class PlumCommand extends Command {
    /**
     * @property {CommandoClient} client
     */

    /**
     * @param {PlumClient} client The client that instantiated the command.
     * @param {*} options Any option for the command is defined here.
     */
    constructor(client, options) {
        options.argsPromptLimit = 0;
        super(client, options);

        // this.argsCollector = options.args && options.args.length ?
        //     new ArgumentCollector(client, options.args) :
        //     null;

        this.permLevel = options.permLevel || 1;
        if (this.ownerOnly) this.permLevel = 10;
        if (this.permLevel == 10) this.ownerOnly = true;

        this.premium = false;

        /** @type {PlumClient} */
        this.client;

        let expl = (options.args ? Object.values(options.args).map(o => {
            let [op, c] = o.default != null && o.default != undefined ? ["[", "]"] : ["<", ">"];
            return `${op}${o.label || o.key}${c}`;
        }).reverse().reduce((prev, k) => {
            return {
                [k]: "No explanation",
                ...prev};
        }, {}) : {});
        /** @type {Object.<string, string>} */
        this.formatExplanation = {
            ...expl, 
            ...options.formatExplanation
        };
        if (Object.values(this.formatExplanation).some(s => s == "No explanation"))
            console.log(this.name, require("util").inspect(this.formatExplanation))
    }

    /**
     * @property {PlumClient} client 
     */

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

    /**
     * 
     * @param {PlumMessage} msg 
     * @param {any[]} responces 
     * @param {Embed} embed 
     */
    async responceSelector(msg, responces, embed) {
		let WaitMessage = `Within the next 60 seconds, you'll need to pick a number between 1-${responces.length}. `
                        + "The command will be automatically canceled canceled in 30 seconds if no selection has been made. "
                        + "Alternatively, type `cancel` to manually cancel the command, skipping the countdown"

		switch(responces.length) {
			case 0:
				embed
					.setDescription(`There have been no results found for your search query. Try using a different name.`)
					.setFullFooter(`Requested by ${msg.author.tag}`, msg.author.displayAvatarURL({format: 'png'}))
					.setTimestamp(new Date());

				msg.channel.send(embed);
				return null;
			case 1:
				return responces[0];
			case 2:
			case 4:
			case 6:
			case 8:
				embed
					.setDescription("Requested by " + msg.author.tag)
					.setFullFooter(WaitMessage)
					.setTimestamp(new Date());

				for (let i in responces) {
					if (isNaN(i)) continue;

                    // @ts-expect-error
                    // This is implemented in the subclasses that call this method
					embed = await this.handleSelector(responces, i, await embed, msg.author.lang)
				}

				msg.channel.send(embed);
				break;
			default:
				let resp = '';
				let whattoadd;
				for (let i in responces) {
					if (isNaN(i)) continue;

                    // @ts-expect-error
                    // This is implemented in the subclasses that call this method
					whattoadd = await this.handleSelector(responces, i, null, msg.author.lang)
					console.log(whattoadd)
					resp += whattoadd
				}

				resp += `\n` + WaitMessage;
				embed
					.setFooter(`Requested by ${msg.author.tag}`, msg.author.displayAvatarURL({format: 'png'}))
					.setTimestamp(new Date())
					.setDescription(resp);
				msg.channel.send(embed);
		}

		let filter = response => response.author.id == msg.author.id && (!isNaN(response.content) && parseInt(response.content) <= responces.length && parseInt(response.content) > 0 || response.content == 'cancel');
		try {
			let collected = await msg.channel.awaitMessages(filter, { max: 1, time: 60 * 1000, errors: ['time'] })

			if(collected.first().content == 'cancel') {
				msg.info('Command canceled');
				return null
			}
			
			return await responces[+(collected.first().content) - 1]
		} catch (e) {
			msg.info('Command canceled');
			return null
		}
    }

    // msg = Message,
    // messages = an array of anything that can be sent
    async pagination(msg, messages, additionalPage = null) {
        if (messages.length == 1)
            return msg.channel.send(messages[0]);
        
        let index = 0;
        let info = false;
        let add = false;

        let emojis = this.client.utils.emojis;
        let infoEmbed = this.client.utils.embed()
            .setTitle(emojis.info + " Pagination")
            .setDescription(
                "This is the help page for the Pagination menu.\n" +
                "The following is an explanation for the reaction emojis.")
            .addField(
                "Emojis",
                stripIndents`${emojis.first} Go to the first page.
                    ${emojis.prev} Go back one page, or loop to the last page if at the first one.
                    ${emojis.stop} Stops the interactive menu.
                    ${emojis.next} Go forward one page, or loop to the first page if at the last one.
                    ${emojis.last} Go to the last page.
                    ${emojis.info} Toggle this menu.` + (additionalPage ?
                    `\n${additionalPage.emoji || emojis.asterisk} Shows an additional information page, relevant to the topic.` :
                    "")
            )
            .addField(
                "How can I go back?",
                `Simply react with ${emojis.info} again.`)
            .addField(
                "Useful Links",
                oneLine`
                [Official Website](${process.env.DOMAIN}) | 
                [All commands](${process.env.DOMAIN}/commands) |
                [Official Support Server](${process.env.DOMAIN}/server)`);

        /* eslint-disable no-unused-vars */
        const R = [
            [emojis.first, (collector) => {
                info = add = false;
                index = 0
            }],
            [emojis.prev,  (collector) => {
                info = add = false;
                index--
            }],
            [emojis.stop,  (collect__) => {
                info = add = false;
                collect__.stop("manual")
            }],
            [emojis.next,  (collector) => {
                info = add = false;
                index++
            }],
            [emojis.last,  (collector) => {
                info = add = false;
                index = messages.length - 1
            }],
            [emojis.info,  (collector) => {
                if (add) {
                    add = false;
                    info = true;
                } else 
                    info = !info
            }],
        ];

        if (additionalPage) {
            R.push([
                additionalPage.emoji || emojis.asterisk, collector => {
                    add = !add;
                }
            ])
        }
        /* eslint-enable no-unused-vars */

        let message = await msg.channel.send(messages[0]);
        // eslint-disable-next-line no-unused-vars
        for (let [react, cb] of R) {
            await message.react(react);
        }

        const filter = (reaction, user) => {
            return R.map(r => r[0]).some(emoji => reaction.emoji.name === emoji) && user.id === msg.author.id;
        };

        const collector = message.createReactionCollector(filter, {
            time: 120000
        });

        // eslint-disable-next-line no-unused-vars
        collector.on('collect', async (reaction, user) => {
            if (msg.guild.me.hasPermission("MANAGE_MESSAGES")) 
                await reaction.users.remove(msg.author.id);

            var matching = R.filter(r => r[0] == reaction.emoji.name);
            if (!matching.length) return;

            matching[0][1](collector);
            if (index < 0) index = messages.length - 1;
            index %= messages.length;

            if (add)
                message.edit(additionalPage);
            else if (info)
                message.edit(infoEmbed);
            else
                message.edit(messages[index]);
        });

        collector.on('end', async (collected, reason) => {
            if (msg.guild.me.hasPermission("MANAGE_MESSAGES"))
                msg.reactions.cache.forEach(r => r.remove());
            let m;
            if (reason === "manual") {
                m = await message.edit("Interactive menu ended successfully.");
            } else {
                m = await message.edit("Interactive menu ended for inactivity.");
            }
            m;
            // m.delete({ timeout: 10000 });
        });
    }

    onBlock(message, reason, data) {
		switch(reason) {
			case 'guildOnly':
				return message.error(`The \`${this.name}\` command must be used in a server channel.`);
			case 'nsfw':
				return message.error(`The \`${this.name}\` command can only be used in NSFW channels.`);
			case 'permission': {
				if(data.response) return message.reply(data.response);
				return message.error(`You do not have permission to use the \`${this.name}\` command.`);
			}
			case 'clientPermissions': {
				if(data.missing.length === 1) {
					return message.error(
						`I need the "${permissions[data.missing[0]]}" permission for the \`${this.name}\` command to work.`
					);
				}
				return message.error(oneLine`
					I need the following permissions for the \`${this.name}\` command to work:
					${data.missing.map(perm => permissions[perm]).join(', ')}
				`);
			}
			case 'throttling': {
				return message.error(
					`You may not use the \`${this.name}\` command again for another ${data.remaining.toFixed(1)} seconds.`
				);
			}
			default:
				return null;
		}
	}

    isGood(variable) {
		return (variable && variable !== null && (variable.size || variable.length))
	}
}