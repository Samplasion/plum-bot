const Command = require("./Command");
const PlumClient = require("../Client");

module.exports = class PremiumCommand extends Command {
    /**
     * @param {PlumClient} client
     * @param {import("discord.js-commando").CommandInfo} info
     */
    constructor(client, info) {
        super(client, info);

        this.premium = true;
    }

    /**
     * @param {*} msg 
     */
    hasPermission(msg) {
        if (!msg.author.isPremium && !msg.guild.isPremium)
            return "This is a premium-only command. To know more about Plum Premium and its "
                + "perks, check out the `premium` command.";
        return super.hasPermission(msg);
    }
}