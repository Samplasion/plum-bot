const Command = require("../../classes/Command");

module.exports = class FirstMessageCommand extends Command {
	constructor(client) {
		super(client, {
			name: "first-message",
			aliases: ["first-msg"],
			group: "entertainment",
			memberName: "firstmsg",
			description: "Responds with the first message ever sent to a channel.",
            clientPermissions: ["EMBED_LINKS"],
            guildOnly: true,
			args: [
				{
					key: "channel",
					type: "channel",
					default: msg => msg.channel,
					prompt: "",
				}
			]
		});
	}

	async run(msg, { channel }) {
        try {
            const messages = await channel.messages.fetch({ after: 1, limit: 1 });
            const message = messages.first();
        } catch {
            return msg.error(`I don't have permission to read ${channel}.`);
        }

        return this.client.registry.commands.get("quote").run(msg, { message });
	}
};