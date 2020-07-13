const { oneLine } = require('common-tags');
const Command = require('./../../classes/Command.js');

module.exports = class SaveEmojiCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'saveemoji',
            aliases: ["steal"],
			group: 'util',
			memberName: 'saveemoji',
			description: "It ",
			throttling: {
				usages: 5,
				duration: 10
			},

            clientPermissions: ["MANAGE_EMOJIS"],
            userPermissions: ["MANAGE_EMOJIS"],

            args: [
                {
                    key: "name",
                    type: "string",
                    prompt: "what is the name of the emoji gonna be?"
                },
                {
                    key: "url",
                    type: "string",
                    default: "",
                    prompt: ""
                }
            ]
		});
	}

	async run(msg, { name, url }) {
        if (!url) {
            if (msg.attachments.size) {
                url = msg.attachments.first().url;
            } else return msg.error("The emoji must be an emoji from another server");
        }

        try {
            let emoji = await msg.guild.emojis.create(url, name);
            msg.ok(`The emoji was created: ${emoji}`);
        } catch (e) {
            console.error(msg.id, e);
            return msg.error("An unknown error has prevented the creation of an emoji. " + 
                `Error ID: \`${msg.id}\``);
        }
	}
};