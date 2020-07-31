const Command = require("./Command");
const { MessageAttachment } = require("discord.js");
const { oneLine } = require("common-tags")

module.exports = class SRACanvasCommand extends Command {
    constructor(client, {
        name,
        aliases = [],
        desc = `Applies a ${name} filter on your (or someone else's) avatar.`,
        api = name,
        punchline = `Here's your ${name} avatar.`,
        format = "png"
    } = {}) {
        super(client, {
            name,
            aliases,
            group: 'imgman',
            memberName: name,
            description: desc,
            format: '[user|url]',
            details: oneLine`This command gets the image
            from a URL, a user mention, one of the last
            messages' attachments and, if anything else didn't
            work, falls back to the your profile picture.`,
            formatExplanation: {
                "<image>": "An attachment, URL, username/mention, one of the last messages' attachments or your avatar, if anything else fails."
            },
            examples: [
                `${name}`,
                `${name} @User`,
            ],
            args: [{
                key: "image",
                type: "image",
                prompt: ""
            }]
        });

        this.api = api;
        this.punchline = punchline;
        this.format = format;
    }

    async run(msg, { image }) {
        msg.channel.startTyping();

        let buf = await this.client.sra.api.canvas[this.api](image);
        let attachment = new MessageAttachment(buf, `${this.name}.${this.format}`);

        msg.channel.stopTyping(true);

        msg.channel.send(this.punchline, attachment);
    }
};