const Command = require('./../../classes/Command.js');
const { oneLine } = require("common-tags");
 
module.exports = class GiveawayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'giveaway',
            aliases: ["ga"],
            group: 'util',
            memberName: 'giveaway',
            description: "Creates a giveaway in your channel.",
            args: [
               {
                   key: "action",
                   type: "string",
                   prompt: "",
               },
               {
                   key: "item",
                   type: "string",
                   prompt: "",
               },
            ]
        });
    }
 
    async run(msg, { action, item }) {
        msg.error("Not implemented")
    }
};