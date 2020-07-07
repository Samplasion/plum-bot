const Command = require('../../classes/Command.js');
// @ts-ignore
const { GuildMember } = require("discord.js");
const { oneLine, stripIndent } = require('common-tags');
const {
    Connect4,
    Connect4Player,
    Connect4Slot,
    Connect4State
} = require("../../classes/games/Connect4");

module.exports = class ConnectFourCommand extends Command {
    /**
     * @param {*} client 
     */
    constructor(client) {
        super(client, {
            name: 'connectfour',
            group: 'fun',
            aliases: ["c4"],
            memberName: 'connectfour',
            description: 'Play some "Connect 4" with someone else!',
            // details: oneLine`The format for the argument is the following:
            //   \`NUMBER DELIMITER NUMBER SYMBOL?\`, where:` + "\n" + stripIndent`\n
            //   NUMBER is, quite obviously, any number;
            //   DELIMITER is one of the following symbols: \`.*x-_|&\`; and
            //   SYMBOL is optional and can be either \`?\` or \`!\`.
            //   There can be an arbitrary amount of space between each "token" of the format.`,
            examples: ['minesweeper', "minesweeper 2x3", "minesweeper 4 - 1 !", "minesweeper 3 . 4?"],
            ownerOnly: true,
            guildOnly: true,
            args: [{
                key: 'colOrMem',
                label: "column or member",
                prompt: 'what cell do you wanna click on (or, if the game isn\'t started yet, how big should the grid be)?',
                type: 'integer|member',
                default: ""
            }]
        });

        /** @type {Object.<string, Connect4>} */
        this.games = {}
    }

    /**
     * @param {*} msg 
     * @param {object} args 
     * @param {number|GuildMember} [args.colOrMem]
     */
    async run(msg, { colOrMem }) {
        if (colOrMem instanceof GuildMember) {
            let member = colOrMem;

            if (Object.keys(this.games).some(k => (k.includes(msg.member.id)) && k.endsWith(msg.guild.id)))
                return this.client.utils.sendErrMsg(msg, "You already have an ongoing game.");
            if (Object.keys(this.games).some(k => (k.includes(member.id)) && k.endsWith(msg.guild.id)))
                return this.client.utils.sendErrMsg(msg, `${member.displayName} already has an ongoing game.`);

            let key = `${msg.member.id}-${member.id}-${msg.guild.id}`;
            let agree = await member.user.ask(msg.channel, `<@${member.id}>, do you wanna play some Connect 4 with ${msg.member.displayName}?`);

            if (agree) {
                this.games[key] = new Connect4(msg.member, member);
                return msg.channel.send(this.games[key].grid);
            }

            return this.client.utils.sendErrMsg(msg, `<@${msg.author.id}>, I'm sorry, ${member.displayName} refused to play with you.`);
        } else {
            /** @type {number} */
            let column = colOrMem;
            let key = Object.keys(this.games).filter(game => game.endsWith(msg.guild.id)).filter(game => game.includes(msg.author.id))[0];
            let game = this.games[key];

            if (!game)
                return this.client.utils.sendErrMsg(msg, `You have no ongoing games! Run \`${msg.prefix}connectfour @Someone\` to play with a friend.`);

            if (column < 1 || column > game.size.width)
                return msg.error(`The column must be a number between 1 and ${game.size.width}.`);
          
            if (!column) {
                return msg.channel.send(this.gridEmbed(game));
            }
          
            if (msg.author.id != (game.lastPlayer == Connect4Player.RED ? game.players.yellow : game.players.red).id)
                return msg.error();
            
            let state = game.move(game.lastPlayer == Connect4Player.RED ? Connect4Player.YELLOW : Connect4Player.RED, column);
            if (state != Connect4State.READY) {
                delete this.games[key];
                if (state == Connect4State.P1_WIN)
                    return msg.channel.send(`${game.players.red}, you won!`);
                if (state == Connect4State.P2_WIN)
                    return msg.channel.send(`${game.players.yellow}, you won!`);

                if (state == Connect4State.DRAW)
                    return msg.channel.send(`It's a draw!`);
            }

            msg.channel.send(this.gridEmbed(game));
        }
    }

    /**
     * Returns an embed with the details about this game.
     * @param {Connect4} game The game that's in progress.
     */
    gridEmbed(game) {
        let turn, next;
        if (game.lastPlayer == Connect4Player.RED)
            [turn, next] = [`${game.players.yellow}`, `${game.players.red}`]
        else
            [turn, next] = [`${game.players.red}`, `${game.players.yellow}`]

        return this.client.utils.fastEmbed(
            "Connect Four game",
            "```" + game.grid + "```",
            [
                ["State", Connect4.prettyState(game.state)],
                ["This turn", turn, true],
                ["Next turn", next, true],
            ]
        )
    }
};