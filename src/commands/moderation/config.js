const Command = require("../../classes/commands/Command");

module.exports = class ConfigCommand extends Command {
    constructor(client) {
        super(client, {
            name: "config",
            aliases: ["conf", "settings", "sets"],
            group: "moderation",
            memberName: "config",
            description: "Sends a link from which you can change the server's configuration.",
            examples: ["conf"],
            guildOnly: true,
            permLevel: 3
        });
    }

    async run(msg) {
        return msg.info("Web Dashboard:\n\n" + process.env.DOMAIN + "/dashboard/" + msg.guild.id + "/home");
    }
};