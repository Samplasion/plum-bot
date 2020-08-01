const { createCanvas, loadImage } = require('canvas');
const { MessageAttachment } = require('discord.js');
const Command = require('../../classes/Command');

module.exports = class CoinCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'dice',
            aliases: ['dice-cast', 'dice-roll', 'dice'],
            group: 'entertainment',
            memberName: 'dice',
            description: 'Rolls a dice.',
            args: [
                {
                    key: "max",
                    type: "integer",
                    min: 3,
                    max: 20,
                    default: 6,
                    prompt: ""
                }
            ]
        });
    }

    async run(msg, { max }) {
        let n = Math.floor(Math.random() * max) + 1;

        let img = await loadImage(asset("images", "icosahedron.jpg"));
        let canvas = createCanvas(img.width, img.height);
        let ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        ctx.textBaseline = 'middle';
        ctx.textAlign = "center";
        ctx.font = "30px Arial";

        ctx.fillText(`${n}`, canvas.width/2, canvas.height/2);

        let embed = msg.makeEmbed()
            .setTitle("Dice roll")
            .setDescription(`It landed on ${n}`)
            .attachFiles([new MessageAttachment(canvas.toBuffer(), "dice.png")])
            .setImage("attachment://dice.png");

        return msg.channel.send(embed);
    }
};