const Image = require('../../classes/commands/ImageCommand.js');
const { oneLine } = require("common-tags");

module.exports = class DistortCommand extends Image {
    constructor(client) {
        super(client, {
            name: "distort",
            group: "imgman",
            memberName: "distort",
            description: "Generates a distorted version of your image.",
            format: '[...user|...url] [--threshold=1-255]',
            examples: [
                `distort`,
                `distort @User`,
            ],
            formatExplanation: {
                "[--threshold=1-255]": "The threshold (when the pixels are to be considered black or white). Capped at 1 and 255."
            },
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