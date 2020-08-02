const Command = require('./../../classes/Command.js');
const phin = require("phin");
 
module.exports = class TftCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'tft',
            aliases: ["this-for-that", "this-4-that"],
            group: 'entertainment',
            memberName: 'tft',
            description: "So, basically, it's like a command for this meme.",
            args: []
        });
    }
 
    async run(msg) {
        let { body: { this: this_, that } } = await phin({
            url: "http://itsthisforthat.com/api.php?json",
            parse: "json"
        });

        let e = msg.makeEmbed()
            .setTitle("Wait, what does your startup do?")
            .setDescription(`So, basically, it's like a ${this_} for ${that}!`);
        return msg.channel.send(e);
    }
};