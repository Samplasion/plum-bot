const { oneLine } = require('common-tags');
const Command = require('../../classes/Command.js');

module.exports = class PremiumStatusCommand extends Command {
    // @ts-expect-error
	constructor(client) {
		super(client, {
			name: 'premium',
			group: 'commands',
			memberName: 'premium',
			description: "Check your premium status and what you can do to obtain it."
		});
	}

    /**
     * @param {*} msg 
     * @returns {Promise<*>}
     */
	async run(msg) {
        if (msg.author.isPremium) {
            return msg.channel.send(this.client.utils.fastEmbed(
                "Your premium status",
                "😃 You have Premium!"
            ));
        } else {
            return msg.channel.send(this.client.utils.fastEmbed(
                "Your premium status", 
                "🙁 You don't have Premium!",
                [
                    [
                        "What can I do to obtain Premium?",
                        "Obtaining Premium is easy! First, you got to " +
                        `be in [the Support server](${this.client.options.invite}). ` +
                        "Then, you can " +
                        "[donate to the Patreon page](https://www.patreon.com/samplasion) " +
                        "subscribe to one of the Premium tiers. Finally, alert Samplasion " +
                        "and, if all went well, you can enjoy the premium commands!"
                    ]
                ]
            ));
        }
	}
};