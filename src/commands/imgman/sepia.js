const Image = require('../../classes/commands/ImageCommand.js');
const { oneLine } = require("common-tags");

module.exports = class SepiaCommand extends Image {
    constructor(client) {
        super(client, {
            name: "sepia",
            group: "imgman",
            memberName: "sepia",
            description: "Generates a sepia version of your image.",
            format: '[...user|...url]',
            formatExplanation: {
                "[...user|...url]": oneLine`A space separated list of
                links or usernames. If nothing is specified, then the last
                image will be used instead.`
            },
            examples: [
                `distort`,
                `distort @User`,
            ],
            args: [],
            line: "Here's your distorted image."
        })
    }

    operate(msg, { context }, canvas, ctx) {
        let level = 5;
        let t = msg.flags.level;
        if (t && typeof t == "number")
            level = t;
        level = level.clamp(1, 10)

        // console.log(ctx, level, 0, 0, canvas.width, canvas.height);

        return this.distort(ctx, level, 0, 0, canvas.width, canvas.height);
    }
}