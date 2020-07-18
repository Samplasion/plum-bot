const Command = require('./../../classes/Command.js');

module.exports = class ColorCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'color',
            group: 'fun',
            memberName: 'color',
            description: "Displays a color from a hexadecimal notation",

            args: [{
                key: "color",
                validate: (arg) => {
                    return /[#A-F0-9]/g.test(arg.toUpperCase()) && (
                        arg.length == arg.startsWith("#") ? 7 : 6 || // "#FFFFFF" or "FFFFFF"
                        arg.length == arg.startsWith("#") ? 4 : 3    // "#FFF" or "FFF"
                    );
                },
                parse: (arg) => {
                    if (arg.startsWith("#"))
                        arg = arg.substr(1);
                    return arg.toUpperCase();
                },
                prompt: "you must pass a valid hexadecimal string."
            }]
        });
    }

    async run(msg, { color }) {
        let long = color;
        if (color.length == 3)
            long = long.split("").map(c => `${c}${c}`).join("");
        let embed = this.client.utils.embed()
            .setColor(long)
            .setImage("https://some-random-api.ml/canvas/colorviewer?hex=" + color);
        msg.channel.send("Here's your color.", { embed })
    }
};