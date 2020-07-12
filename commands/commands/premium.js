const { oneLine } = require('common-tags');
const Command = require('../../classes/Command.js');

module.exports = class PremiumStatusCommand extends Command {
    // @ts-expect-error
	constructor(client) {
		super(client, {
			name: 'premium',
			group: 'commands',
			memberName: 'premium',
			description: "Check your premium status and what you can do to obtain it.",

            args: [{
                key: "user",
                type: "user",
                default: msg => msg.author,
                prompt: ""
            }]
		});
	}

    /**
     * @param {*} msg 
     * @returns {Promise<*>}
     */
	async run(msg, { user }) {
        let you = user.id == msg.author.id ? "you" : user.username;
        let You = user.id == msg.author.id ? "You" : user.username;
        let Your = user.id == msg.author.id ? "Your" : user.username + "'s";
        let youre = user.id == msg.author.id ? "you're" : user.username + "'s";
        let have = you == "you" ? "have" : "has";
        let dont = you == "you" ? "don't" : "doesn't";

        console.log(msg.author.isPremium, msg.guild.isPremium);

        if (msg.author.isPremium) {
            return msg.channel.send(this.client.utils.fastEmbed(
                `${Your} premium status`,
                `😃 ${You} ${have} Premium!`
            ));
        } else if (msg.guild && msg.guild.isPremium) {
            return msg.channel.send(this.client.utils.fastEmbed(
                `${Your} premium status`,
                `🙃 ${You} ${dont} have Premium, but ` +
                `one of this server's owners does. This ` +
                `means that, while ${youre} in this server, ` + 
                `${you}'ll be able to use all the Premium perks!`
            ));
        } else {
            return msg.channel.send(this.client.utils.fastEmbed(
                `${Your} premium status`, 
                `🙁 ${You} don't have Premium!`,
                [
                    [
                        `What can I do to obtain Premium?`,
                        `Obtaining Premium is easy! First, you got to ` +
                        `be in [the Support server](${this.client.options.invite}). ` +
                        `Then, you can ` +
                        `[donate to the Patreon page](https://www.patreon.com/samplasion) ` +
                        `subscribe to one of the Premium tiers. Finally, alert Samplasion ` +
                        `and, if all went well, you can enjoy the premium commands!`
                    ]
                ]
            ));
        }
	}
};