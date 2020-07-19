const Command = require('../../classes/Command');

module.exports = class RandTextCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'points',
            aliases: ['mypoints'],
            group: 'util',
            memberName: 'points',
            description: 'Lets you see how many points you have.',
            examples: ['perms'],
            guildOnly: true,
            args: [
                {
                    key: 'user',
                    type: 'member',
                    prompt: 'who do you want to see the permissions of?',
                    default: '',
                },
            ],
        });
    }

    run(message, { user }) {
        // If pinged user, that. Otherwise message member
        let member = user || message.member;
        let next = Math.ceil(Math.sqrt(member.points.data.points/100));
        return message.channel.send(
            this.client.utils
                .fastEmbed(
                    'Points', 
                    `${member.points.data.points} points`, 
                    [
                        ['Level', member.points.data.level],
                        ['Next', `Level ${next} at ${(next ** 2) * 100} points`]
                    ]
                )
                .setAuthor(member.displayName, member.user.displayAvatarURL())
        );
    }
};
