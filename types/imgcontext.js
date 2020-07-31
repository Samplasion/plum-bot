const { ArgumentType } = require("discord.js-commando");
const { isURL } = require("validator");
const urlOpts = {
    require_protocol: ["http", "https"]
}
const { loadImage, createCanvas } = require("canvas")

function hasImageAttachment(message) {
    return message.attachments.size && message.attachments.some(att => /\.(png|jpe?g|gif)$/.test(att.proxyURL.split(/[?#]/)[0]));
}

/**
 * Guaranteed to always return a context.
 */
module.exports = class ImageType extends ArgumentType {
    constructor(client) {
        super(client, "imgcontext");
    }

    // eslint-disable-next-line no-unused-vars
    isEmpty(val, msg, arg) {
        return false;
    }

    // eslint-disable-next-line no-unused-vars
    async validate(val, msg, arg) {
        return true;
    }

    async parse(val, msg, arg) {
        let images = [];
        let type = this.client.registry.types.get("image");

        if (val) {
            for (let value of val.split(/\s+/g)) {
                images.push(await type.parse(value, msg, arg));
            }
        } else images.push(await type.parse(val, msg, arg));

        let { width: w, height: h } = await this.client.utils.largestSize(images);
        let canvas = createCanvas(w, h);
        let ctx = canvas.getContext("2d");

        let currentimage, widthpad, heightpad;

        for (var image of images) {
			currentimage = await loadImage(image);

			widthpad = (w - currentimage.width) / 2;
			heightpad = (h - currentimage.height) / 2;

			ctx.drawImage(currentimage, widthpad, heightpad, currentimage.width, currentimage.height);
        }
        
        return { canvas, ctx };
    }
}