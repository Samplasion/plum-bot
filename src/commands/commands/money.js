const Command = require('../../classes/commands/Command');
const { oneLine } = require("common-tags");

module.exports = class MoneyCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'money',
            aliases: ['mymoney', 'balance', 'bal'],
            group: 'commands',
            memberName: 'money',
            description: 'Lets you see how much money you have.',
            examples: ['money', "money someone else"],
            formatExplanation: {
                "[user]": "The user you want to see the balance of (defaults to you)"
            },
            args: [
                {
                    key: "user",
                    type: "user",
                    prompt: "who do you want to see the permissions of?",
                    default: (msg) => msg.author
                }
            ]
        });
    }

    run(message, { user }) {
        return message.say(
            this.client.utils.fastEmbed("Money", `$${user.money}`, [
                [
                    "What can I do with money?",
                    "Money allows you to obtain special perks " + 
                    "without paying actual, real life money for it. To " + 
                    `check the available offers, use ${message.prefix}**shop**. ` +
                    "Keep in mind, though, that the shop is open only if " +
                    `you're in [Plum's Official Server](${this.client.options.invite})`
                ],
                [
                    "How can I earn money?",
                    oneLine`You can earn more money by voting on the
                    following lists. Each vote warrants $1 added to your balance.` + "\n\n" +
                    `[Glenn Bot List](https://glennbotlist.xyz/bot/${this.client.user.id}/vote) | [botlist.space](https://botlist.space/bot/${this.client.user.id}/upvote) | [Bots for Discord](https://botsfordiscord.com/bot/${this.client.user.id}/vote)`
                ]
            ])
            .setAuthor(user.username, user.displayAvatarURL())
        );
    }
};