// @ts-disable
const Command = require('./../../classes/Command.js');
const { oneLine } = require("common-tags");
const { default: parse } = require('parse-duration');
 
module.exports = class GiveawayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'giveaway',
            aliases: ["ga"],
            group: 'util',
            memberName: 'giveaway',
            description: "Creates a giveaway in your channel.",
            details: oneLine`Most of the actions of this command require a Message ID.
            If you don't know how to get it, [you can find a guide here](${process.env.DOMAIN}/getting-ids).`,
            args: [
               {
                   key: "action",
                   label: '"new"|"edit"|"reroll"|"cancel"|"postpone"',
                   type: "string",
                   prompt: "",
               },
               {
                   key: "item",
                   type: "string",
                   prompt: "",
               },
            ],
            permLevel: 2
        });

        this.values = ["create", "edit", "reroll", "cancel", "postpone"];
    }
 
    async run(msg, { action, item }) {
        action = `${action.toLowerCase()}`;

        if (!this.values.includes(action))
            return msg.error(`That action doesn't exist. It must be one of the following: ${this.values.map(s => `\`${s}\``).join(", ")}`);

        if (action == "create")
            return this.create(msg, item);

        return msg.error("Not implemented");
    }

    async create(msg, prize) {
        let flags = ["duration"];
        if (!flags.every(f => msg.flags[f]))
            return msg.error(`The following flags must all be present: ${flags.map(s => `\`${s}\``).join(", ")}`);

        let d = msg.flags.duration;
        if (typeof d != "string")
            return msg.error("The `duration` flag must be a string.");

        let winners = 1
        if (msg.flags.winners && typeof msg.flags.winners == "number")
            winners = msg.flags.winners;

        let maxPerm = 1;
        if (msg.flags.perm && typeof msg.flags.perm == "number")
            maxPerm = msg.flags.perm.clamp(1, 4);
        
        this.client.giveaways.start(msg.channel, {
            prize,
            time: parse(d),
            winnerCount: winners,
            exemptMembers: (member) => member.level.level <= maxPerm
        });
    }
};