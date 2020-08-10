const Command = require('../../classes/commands/Command.js');

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
            formatExplanation: {
                "[--rgb]": "If present, lets you input a color triplet for `color`.",
                "<color>": "Must be a string in the format `RRGGBB` or `RGB`, where each letter " + 
                    "must be a hexadecimal number between 0 and F. (If the `--rgb` flag is " +
                    "present, the color must be in the format `R G B`, where each letter is " +
                    "a number between 0 and 255 inclusive)"
            },

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