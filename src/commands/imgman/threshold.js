const Image = require('../../classes/commands/ImageCommand.js');
const { oneLine } = require("common-tags");

module.exports = class ThresholdCommand extends Image {
    constructor(client) {
        super(client, {
            name: "threshold",
            group: "imgman",
            memberName: "threshold",
            description: "Generates a version of your image but only black and white.",
            format: '[user|url] [--threshold=1-255]',
            examples: [
                `threshold`,
                `threshold @User`,
            ],
            args: [],
            line: "Here's your (quite literally) black and white image."
        })
    }

    operate(msg, { image }, canvas, ctx) {
        let threshold = 128;
        let t = msg.flags.threshold;
        if (t && typeof t == "number" && t > 0 && t < 256)
            threshold = t;

        return this.threshold(ctx, threshold, 0, 0, canvas.width, canvas.height);
    }
}