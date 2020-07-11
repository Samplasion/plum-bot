const Command = require('../../classes/Command');
const { oneLine } = require("common-tags");

module.exports = class RandTextCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            aliases: ['inv'],
            group: 'util',
            memberName: 'invite',
            description:
                'Generates a link to invite the bot with the necessary permissions.',
            examples: ['perms'],
            guildOnly: true,
        });
    }

    run(message) {
        return message.channel.send(
            this.client.utils
                .fastEmbed(
                    'Invite Link for ' + this.client.user.username,
                    oneLine`This is your invite link. To use it, just click on it. It was
                    automatically generated for you with the optimal permissions.` + "\n\n" + 
                    this.client.invite
                )
        );
    }
};
