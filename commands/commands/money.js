const Command = require('../../classes/Command');

module.exports = class MoneyCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'money',
            aliases: ['mymoney'],
            group: 'commands',
            memberName: 'money',
            description: 'Lets you see how much money you have.',
            examples: ['money', "money someone else"],
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
            this.client.utils.fastEmbed("Money", `$${user.money}`, [[
                "What can I do with money?",
                "Money allows you to obtain special perks " + 
                "without paying actual, real life money for it. To " + 
                `check the available offers, use ${message.prefix}**shop**. ` +
                "Keep in mind, though, that the shop is open only if " +
                `you're in [Plum's Official Server](${this.client.options.invite})`
            ]])
            .setAuthor(user.username, user.displayAvatarURL())
        );
    }
};