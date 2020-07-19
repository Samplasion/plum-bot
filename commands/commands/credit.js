const { oneLine } = require('common-tags');
const Command = require('./../../classes/Command.js');

module.exports = class CreditCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'credit',
			group: 'commands',
			memberName: 'credit',
			description: `See the amazing people behind ${client.user.username}!`,
			throttling: {
				usages: 5,
				duration: 10
			}
		});
	}

	async run(msg) {
        let embed = this.client.utils.embed()
        .setTitle("Credits")
        .setDescription(this.cluent.user.username + " was made by Samplasion.")
        .addInline("Audio commands", "Made by NightScript#5597")

        msg.channel.send(embed);
	}
};