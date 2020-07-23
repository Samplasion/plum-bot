const Command = require('./../../classes/Command.js');

module.exports = class AvatarCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'avatar',
            aliases: ["av"],
            group: 'util',
            memberName: 'avatar',
            description: "Displays someone's avatar.",
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