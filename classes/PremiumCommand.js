const Command = require("./Command");

module.exports = class PremiumCommand extends Command {
    /**
     * @param  {...*} args
     */
    constructor(...args) {
        // @ts-expect-error
        super(...args);

        this.premium = true;
    }

    /**
     * @param {*} msg 
     */
    hasPermission(msg) {
        if (!msg.author.isPremium)
            return "This is a premium-only command. To know more about Plum Premium and its "
                + "perks, check out the `premium` command.";
        return super.hasPermission(msg);
    }
}