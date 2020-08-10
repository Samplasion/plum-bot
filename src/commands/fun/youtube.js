const Command = require('../../classes/commands/Command.js');
const { MessageAttachment } = require("discord.js");

module.exports = class YoutubeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'youtube',
            aliases: ["comment", "yt"],
            group: 'fun',
            memberName: 'youtube',
            description: "Displays a comment on YouTube as if you'd written it",
            args: [
               {
                   key: "comment",
                   type: "string",
                   prompt: "",
               },
            ],
            format: '<comment> [--user="user name or ID"]',
            formatExplanation: {
                "<comment>": "The text of your comment",
                '[user="user name or ID"]': "If specified, pose as someone else"
            },
        });
    }

    async run(msg, { comment }) {
        msg.channel.startTyping();
        
        let member = msg.member;
        if (msg.flags.user) {
            let t = this.client.registry.types.get("member");
            let ret = await t.validate(msg.flags.user, msg, {});
            if (typeof ret != "string" && !!ret) {
                member = await t.parse(msg.flags.user, msg, {});
            } else {
                msg.channel.stopTyping(true);
                return msg.error(ret || "Make sure the user is valid.");
            }
        }

        let buf = await this.client.sra.api.canvas.youtubeComment({
            avatar: member.user.displayAvatarURL({ format: "png", size: 1024 }),
            username: member.displayName,
            comment
        });
        let attachment = new MessageAttachment(buf);

        msg.channel.stopTyping(true);

        msg.channel.send("Here's your comment.", attachment);
    }
};