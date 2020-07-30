const Command = require('./../../classes/Command.js');
const { MessageAttachment } = require("discord.js");
const { createCanvas, loadImage } = require('canvas')

module.exports = class CropCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'crop',
            aliases: [],
            group: 'imgman',
            memberName: 'crop',
            description: "Crops an image to the specified size",
            args: [{
                key: "image",
                type: "image",
                prompt: ""
            }]
        });
    }

    asNum(msg, flag) {
        let val = msg.flags[flag];
        if (typeof val != "string" && typeof val != "number")
            return "The `" + flag + "` flag requires a value."
        
        if (typeof val != "number" && (isNaN(val) || val.includes(".")))
            return `The \`${flag}\` flag requires an integer value.`;

        return typeof val == "number" ? val : parseInt(val);
    }

    async run(msg, { image }) {
        if (!Math.clamp)
            Math.clamp = (value, min, max) => Math.max(Math.min(value, max), min);
        
        console.log(image)
        let img = await loadImage(image);

        let width = img.width;
        if (msg.flags.width) {
            let w = this.asNum(msg, "width");
            if (typeof w == "string")
                return msg.error(w);
            width = Math.clamp(w, 1, width);
        }

        let height = img.height;
        if (msg.flags.height) {
            let h = this.asNum(msg, "height");
            if (typeof h == "string")
                return msg.error(h);
            height = Math.clamp(h, 1, height);
        }
        
        console.log(msg.flags, width, height);

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0);

        let buf = canvas.toBuffer('image/png');
        let att = new MessageAttachment(buf, "crop.png");

        return msg.channel.send("Here's your cropped image.", att);
    }
};