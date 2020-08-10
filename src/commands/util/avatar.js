const Command = require('../../classes/commands/Command.js');

module.exports = class AvatarCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'avatar',
            aliases: ["av"],
            group: 'util',
            memberName: 'avatar',
            description: "Displays someone's avatar.",
            formatExplanation: {
                "[user]": "The user you want to see the avatar of (defaults to you)"
            },
            args: [
               {
                   key: "user",
                   type: "user",
                   prompt: "",
                   default: msg => msg.author
               },
            ]
        });
    }

    async run(msg, { user }) {
        let e = this.client.utils.embed()
            .setAuthor(user.tag, user.displayAvatarURL({ format: "png", size: 1024 }))
            .setTitle(`${user.username}'${user.username.endsWith("s") ? "" : "s"} avatar`)
            .setDescription(`[Link](${user.displayAvatarURL({ format: "png", size: 1024 })})`)
            .setImage(user.displayAvatarURL({ format: "png", size: 1024 }));
        return msg.channel.send(e)
    }
};