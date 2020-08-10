const { ArgumentType } = require("discord.js-commando");

module.exports = class ImageType extends ArgumentType {
    constructor(client) {
        super(client, "color");
    }

    get rgbRegex() {
        return /(?:rgb\()?(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(?:,|\s*)\s*(25[0-5]|2[0-4][0-9]|1?[0-9]?[0-9])(?:,|\s*)\s*(25[0-5]|2[0-4][0-9]|1?[0-9]?[0-9])\)?/g;
    }

    // eslint-disable-next-line no-unused-vars
    isEmpty(val, msg, arg) {
        if (msg.flag("rgb"))
            return !val || !this.rgbRegex.test(val.toLowerCase());

        if (!val)
            return true;

        let r = /[#A-F0-9]/g.test(val.toUpperCase()) && (
            val.length == val.startsWith("#") ? 7 : 6 || // "#FFFFFF" or "FFFFFF"
            val.length == val.startsWith("#") ? 4 : 3    // "#FFF" or "FFF"
        );
        console.log(r);
        return !r;
    }

    validate(arg, msg) {
        if (msg.flags.rgb) {
            const rgb = this.rgbRegex;
            let ret = rgb.test(arg.toLowerCase());
            console.log("val", arg, rgb, ret);
            return ret;
        }
        return /[#A-F0-9]/g.test(arg.toUpperCase()) && (
            arg.length == arg.startsWith("#") ? 7 : 6 || // "#FFFFFF" or "FFFFFF"
            arg.length == arg.startsWith("#") ? 4 : 3    // "#FFF" or "FFF"
        );
    }

    parse(arg, msg) {
        if (msg.flags.rgb) {
            const rgb = this.rgbRegex;
            let par = rgb.exec(arg.toLowerCase());
            console.log("par", par);
            let [, r, g, b] = par;
            arg = `#${parseInt(r).toString(16)}${parseInt(g).toString(16)}${parseInt(b).toString(16)}`;
        }
        if (arg.startsWith("#"))
            arg = arg.substr(1);
        return arg.toUpperCase();
    }
}