const Command = require('./../../classes/Command.js');

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'say',
            aliases: [],
            group: 'util',
            memberName: 'say',
            description: "Repeats what you say (useful for announcements).",
            args: [
               {
                   key: "text",
                   type: "string",
                   prompt: "",
               },
            ],
            formatExplanation: {
                "<text>": "The text to repeat."
            },
            guildOnly: true
        });
    }

    async run(msg, { text }) {
        if (msg.guild.me.permissionsIn(msg.channel).has("MANAGE_MESSAGES"))
            await msg.delete();
        
        if (msg.author.level.level >= 9 && msg.noEmbed) {
            msg.channel.send(text);
        } else if (msg.channel.embedable) {
            let embed = this.client.utils.embed()
                .setDescription(text)
                .setAuthor(msg.member.displayName, msg.author.displayAvatarURL());
            msg.channel.send(embed);
        } else return msg.error("I need to have the 'Embed links' permission in order for this command to work.");
    }
};