const { ArgumentType } = require("discord.js-commando");
const { isURL } = require("validator");
const urlOpts = {
    require_protocol: ["http", "https"]
}

function hasImageAttachment(message) {
    return message.attachments.size && /\.(png|jpe?g|gif)$/.test(message.attachments.first().proxyURL);
}

/**
 * Ok, so the strategy is this:
 * 1. Get the attachment of the message;
 * 2. If there isn't any, get the URL from the argument;
 * 3. If there's no URL, get the argument as a GuildMember and get their avatar;
 * 4. If that fails, check through the last 100 messages
 *    if there's a URL or an attachment;
 * 5. If that fails, too, get the user's avatar.
 *
 * In each case, this returns a URL.
 */
module.exports = class ImageType extends ArgumentType {
    constructor(client) {
        super(client, "image");
    }

    // eslint-disable-next-line no-unused-vars
    isEmpty(val, msg, arg) {
        return false;
    }

    // eslint-disable-next-line no-unused-vars
    async validate(val, msg, arg) {
        return true;
    }

    async parse(val, msg, arg) {
        if (msg.attachments && hasImageAttachment(msg))
            return msg.attachments.first().proxyURL;

        if (val && isURL(val, urlOpts) && /\.(png|jpe?g|gif)$/.test(new URL(val).pathname))
            return val;

        let memberType = this.client.registry.types.get("member");
        if (val && await memberType.validate(val, msg, arg)) {
            let member = await memberType.parse(val, msg, arg)
            return member.user.displayAvatarURL({ format: "png", size: 1024 });
        }

        let messageAttachment = false;
        let messages = await msg.channel.messages.fetch({ limit: 100 });
        // Try-catch acts as a break.
        try {
            messages.forEach(message => {
                if (message.attachments.size && /\.(png|jpe?g|gif)$/.test(message.attachments.first().proxyURL)) {
                    messageAttachment = message.attachments.first().proxyURL;
                    throw "break";
                }
            });
        } catch (O_o) {} // eslint-disable-line no-empty

        return messageAttachment || msg.author.displayAvatarURL({ format: "png", size: 1024 });
    }
}