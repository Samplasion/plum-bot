const Command = require('../../classes/Command');

module.exports = class CoinCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'coin',
            aliases: ['coin-flip', 'flip'],
            group: 'entertainment',
            memberName: 'coin',
            description: 'Flips a coin.'
        });
    }

    run(msg) {
        let sides = ['heads', 'tails'];
        let embed = msg.makeEmbed()
            .setTitle("Coin flip")
            .setDescription(`It landed on ${sides[Math.floor(Math.random() * sides.length)]}.`)

        return msg.channel.send(embed);
    }
};