const Command = require('./../../classes/Command.js');

module.exports = class ColorCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'color',
            group: 'fun',
            memberName: 'color',
            description: "Displays a color from a hexadecimal notation",
            format: "[--rgb] <color>",
            examples: [
                "color --rgb 192, 64, 64",
                "color f6f414"
            ],

            // Why don't I declare the regex somewhere else?
            // Because apparently, regex's in JS remember things
            // so it switches between true and false continuously
            args: [{
                key: "color",
                type: "color",
                prompt: "you must pass a valid hexadecimal string."
            }]
        });
    }

    async run(msg, { color }) {
        try {
            let long = color;
            if (color.length == 3)
                long = long.split("").map(c => `${c}${c}`).join("");
            let embed = this.client.utils.embed()
                .setColor(long)
                .setImage("https://some-random-api.ml/canvas/colorviewer?hex=" + color);
            msg.channel.send("Here's your color.", { embed })
        } catch {
            return msg.error("The color isn't a valid hex (or RGB with the `--rgb` flag) color!");
        }
    }
};