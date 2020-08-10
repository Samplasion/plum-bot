const Command = require('../../classes/commands/Command.js');
const { oneLine } = require("common-tags");
const PlumTextChannel = require('../../classes/TextChannel.js');
const PlumNewsChannel = require('../../classes/NewsChannel.js');
const { MessageAttachment, Channel } = require('discord.js');
const phin = require('phin');
const AdmZip = require('adm-zip');
const date = require("date.js");
const limit = 5e7;
 
module.exports = class BackupCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'backup',
            aliases: [],
            group: 'util',
            memberName: 'backup',
            description: "Backs the entire server up",
            details: oneLine`This command can only backup up to 250 messages per channel, and it will skip the channels it`,
            args: [{
                    key: "messages",
                    type: "integer|channel|string", // Allows for both `backup 100 #channel` and `backup #channel 100`
                    label: "number|channel|\"all\"",
                    prompt: "",
                    default: ""
                },
                {
                    key: "channel",
                    type: "channel|integer|string", // Allows for both `backup 100 #channel` and `backup #channel 100`
                    label: "\"all\"|number|channel",
                    prompt: "",
                    default: ""
                }
            ],
            permLevel: 3,
            throttling: {
                usages: 6,
                duration: 3600
            },
            formatExplanation: {
                '[number|channel|"all"]': oneLine`The number of messages 
                    to backup from each channel. Can be any number, but it will 
                    be taken back to a reasonable range. Can alternatively be a channel (see below).`,
                '["all"|number|channel]': oneLine`A channel to save the messages of, or "all" to save
                    all channels (in which case the resulting file will be a .zip file).
                    Can alternatively be a number (see above).`,
            }
        });
    }


 
    async run(msg, { messages: messages_, channel: channel_ }) {
        if (!messages_ && !channel_) {
            channel_ = msg.flags.guild && typeof msg.flags.guild == "string" && msg.author.level.level >= 9 ? "all" : msg.channel;
            messages_ = 100;
        }

        if ((messages_ instanceof Channel || messages_ == "all") && !channel_)
            channel_ = 100;
        if (["string", "number"].includes(typeof messages_) && !channel_)
            channel_ = msg.flags.guild && typeof msg.flags.guild == "string" && msg.author.level.level >= 9 ? "all" : msg.channel;
        
        if (["number", "string"].includes(typeof messages_) && ["number", "string"].includes(typeof channel_) && typeof messages_ == typeof channel_)
            return msg.error('The arguments must be a channel (or "all") and a number of messages, no matter in which order.');

        let messages, chan;

        if (typeof messages_ == "number") {
            messages = messages_;
            chan = channel_;
        } else {
            messages = channel_;
            chan = messages_;
        }

        console.log(`${messages}, ${chan}`);

        if (!(chan instanceof Channel) && chan != "all")
            return msg.error("The `channel` parameter must be a valid channel or \"all\".");
        
        let guild = msg.guild;
        if (msg.flags.guild && typeof msg.flags.guild == "string" && msg.author.level.level >= 9) {
            if (this.client.guilds.cache.has(msg.flags.guild))
                guild = this.client.guilds.cache.get(msg.flags.guild);
            else return msg.error("That guild doesn't exist in cache!");
        }

        let m = await msg.loading("Backing the messages up! This may take some time...");
        messages = messages.clamp(50, 2500);
        /** @type {{ attachment: Buffer, name: string, comment: string }[]} */
        let array = [];
        let ts = Date.now();
        if (chan == "all") {
            for (let channel of [...guild.channels.cache.values()]) {
                let buffer = await this.saveChannel(msg, messages, channel, ts);
                if (buffer && buffer.name && buffer.attachment)
                    array.push(buffer)
            }
        } else {
            let buffer = await this.saveChannel(msg, messages, chan, ts);
            if (buffer && buffer.name && buffer.attachment)
                array.push(buffer)
        }

        console.log(array, array[0]);

        if (!array.length)
            return m.editCombine([
                {
                    type: "error",
                    message: "An unexpected error occurred."
                },
                {
                    type: "info",
                    message: "Please retry, making sure that I have permission to check at least one of the channels."
                }
            ]);

        let attachment;

        if (array.length == 1) {
            attachment = array[0];
        } else {
            let zip = new AdmZip();
            for (let attch of array) {
                zip.addFile(attch.name, attch.attachment, attch.comment);
            }
            attachment = {
                name: `${guild.name.slugify()}-${ts}.zip`,
                attachment: zip.toBuffer()
            }
        }

        
        // If the file is heavier than 50 MB
        if (attachment.attachment.length >= limit)
            return m.editError(oneLine`The resulting file is too heavy for Discord!
                Try with a lower number of messages.`);

        try {
            await msg.author.send(`Here's your backup!`, {
                files: [ attachment ]
            });
            m.editCombine([
                {
                type: "dm",
                message: "Backed up and shot you a DM!"
                }
            ]);
        } catch (e) {
            console.error(e);
            if (e.message.includes("Cannot send"))
                m.editCombine([
                    {
                        type: "error",
                        message: `Your DMs are disabled, so I couldn't send you the backup.`
                    },
                    {
                        type: "info",
                        message: "Enable the DMs and retry."
                    }
                ]);
            else throw e;
        }
    }

    async saveChannel(msg, messages = 100, channel, timestamp) {
        let array = [];

        if (!(channel instanceof PlumNewsChannel) && !(channel instanceof PlumTextChannel)) return null;
        if (!channel.readable) return null;
        console.debug(`Fetching messages for channel #${channel.name}`)
        try {
            array.push((await channel.fetchMessages(messages)).sort((a, b) => a.createdAt - b.createdAt));
        } catch {
            return null;
        }
        array = array.flat();
        console.debug(`Fetched messages for channel #${channel.name}`)

        if (!array[0])
            return null;

        const d = {
            entities: {
                users: {},
                channels: {},
                roles: {}
            },
            messages: [],
            channel_name: array[0].channel.name,
            channel_topic: array[0].channel.topic
        };

        for (let msg of array) {
            msg.mentions.roles.forEach(mention => {
                if (!d.entities.roles[mention.id])
                    d.entities.roles[mention.id] = {
                        name: mention.name,
                        color: mention.color
                    }
            });
            
            [msg.author, ...msg.mentions.users.values()].forEach(mention => {
                if (!d.entities.users[mention.id])
                    d.entities.users[mention.id] = {
                        avatar: mention.displayAvatarURL({ format: "png", dynamic: true }),
                        username: mention.username,
                        discriminator: mention.discriminator,
                        badge: mention.bot ? "BOT" : null
                    }
            });
            
            msg.mentions.channels.forEach(mention => {
                if (!d.entities.channels[mention.id])
                    d.entities.channels[mention.id] = {
                        name: mention.name,
                    }
            });

            d.messages.push({
                id: msg.id,
                author: msg.author.id,
                time: msg.createdTimestamp,
                content: msg.content,
                deleted: msg.deleted,
                embeds: msg.embeds.map(e => e.toJSON()),
                attachments: [...msg.attachments.values()].map(({
                    height, id, name, proxyURL, size, spoiler, url, width,
                }) => {
                    return {
                        height,
                        id,
                        filename: name,
                        proxy_url: proxyURL,
                        size,
                        spoiler,
                        url,
                        width
                    }
                })
            })
        }
        console.log(require("util").inspect(d.entities));

        let buf;

        if (msg.flag("json", "raw", "data")) {
            buf = Buffer.from(JSON.stringify(d));
        } else {
            let body;
            let index = 0;
            do {
                if (index > 0) {
                    await require("util").promisify(setTimeout)(2000);
                }
                body = (await phin({
                    url: "https://glitch-proxy.now.sh/tide-palm-pie/",
                    method: "POST",
                    data: d
                })).body;
                console.log(body.length, index);
                if (body.toString().trim() == "An error occurred with this application.\n\nROUTER_EXTERNAL_TARGET_ERROR" || body.toString().trim() == "failed to start application on tide-palm-pie.glitch.me\n\nThis is most likely because your project has a code error.\nCheck your project logs, fix the error and try again.")
                    return null;
                index++;
            // Account for glitch's stupid "waking up" page
            } while (body.length < 4.99e4 && index < 100);

            buf = body;
        }

        return {
            name: `${channel.guild.name.slugify()}-${channel.name}-${timestamp}.html`,
            attachment: buf,
            comment: `The logs backup of the #${channel.name} channel, stored on ${this.client.utils.fmtDate(new Date(timestamp))}`
        }
    }
};