const Command = require('../../classes/commands/Command');
const Embed = require("../../classes/Embed");

module.exports = class PurgeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'purge',
            group: 'moderation',
            memberName: 'purge',
            description: 'Purges a flooded channel.',
            details: '(Get it? Flooded... purge... no?)',
            guildOnly: true,
            formatExplanation: {
                "[number of messages to purge (≤100)]": "The number of messages to purge. Must be less than or equal to 100 and at least 1.",
            },
            clientPermissions: ["MANAGE_MESSAGES"],
            args: [{
                type: "integer",
                key: "amount",
                label: "number of messages to purge (≤100)",
                default: 100,
                prompt: "how many messages do you want me to purge?",
                validate: text => parseInt(text) > 0 && parseInt(text) <= 100,
            }],
            permLevel: 2,
        });
    }

    async run(msg, {
        amount
    }) {
        await msg.delete();

        let msgs = await msg.channel.messages.fetch({
            limit: amount
        });
        await msg.channel.bulkDelete(msgs);

        let okmsg = await this.client.utils.sendOkMsg(msg, `${amount} message${amount == 1 ? " was" : "s were"} successfully purged.`);
        setTimeout(() => okmsg.delete(), 5000);
        return okmsg;
    }
}