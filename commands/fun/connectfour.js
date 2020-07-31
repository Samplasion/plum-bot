const Command = require('../../classes/Command.js');
// @ts-expect-error
const { GuildMember } = require("discord.js");
const {
    Connect4,
    Connect4Player,
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
            examples: ["connectfour", "connectfour 4"],
            formatExplanation: {
                "[column or member]": "Must be a member of your server if you don't have a started " +
                    "game, or a column number if you do (or if you don't enter this argument, it shows" +
                    "the current state of the game."
            },
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

    getID(msg) {
        return Object.keys(this.games).filter(game => game.endsWith(msg.guild.id)).filter(game => game.includes(msg.author.id))[0];
    }

    /**
     * @param {*} msg 
     * @param {object} args 
     * @param {number|GuildMember} [args.colOrMem]
     * @returns {Promise<Message>}
     */
    async run(msg, { colOrMem }) {
        if (colOrMem instanceof GuildMember) {
            let member = colOrMem;

            if (member.id == msg.member.id)
                return msg.error("You can't play against yourself!");

            if (member.user.bot)
                return msg.error("You can't play against a bot!");

            if (Object.keys(this.games).some(k => (k.includes(msg.member.id)) && k.endsWith(msg.guild.id))) {
                if (Date.now() - this.games[this.getID(msg)].startingTime > 10 * 60000) {
                    let delet;
                    try {
                        delet = await msg.member.ask(msg.channel, `You already have an ongoing game, but it's been going on for more than 10 minutes. Do you wanna delete it?`);
                    } catch (e) {
                        return msg.error("You're already being asked something. Reply to that and retry.");
                    }
                    if (delet) {
                        delete this.games[this.getID(msg)];
                        msg.info("I deleted your game.");
                    } else {
                        return msg.info("I won't delete the game.");
                    }
                } else {
                    return msg.error(msg, "You already have an ongoing game.");
                }
            }
            if (Object.keys(this.games).some(k => (k.includes(member.id)) && k.endsWith(msg.guild.id)))
                return msg.error(msg, `${member.displayName} already has an ongoing game.`);

            let key = `${msg.member.id}-${member.id}-${msg.guild.id}`;

            let agree;
            try {
                agree = await member.ask(msg.channel, `<@${member.id}>, do you wanna play some Connect 4 with ${msg.member.displayName}?`);
            } catch (e) {
                return msg.error("You're already being asked something (probably another user asked you to play). Reply to that and retry.");
            }

            if (agree) {
                let e = this.client.utils.emojis;
                this.games[key] = new Connect4(msg.member, member, { empty: e.blank });
                return msg.channel.send(this.gridEmbed(this.games[key]));
            }

            return msg.error(`<@${msg.author.id}>, I'm sorry, ${member.displayName} refused to play with you.`);
        } else {
            /** @type {number} */
            let column = colOrMem;
            let key = Object.keys(this.games).filter(game => game.endsWith(msg.guild.id)).filter(game => game.includes(msg.author.id))[0];
            let game = this.games[key];

            if (!game)
                return this.client.utils.sendErrMsg(msg, `You have no ongoing games! Run \`${msg.prefix}connectfour @Someone\` to play with a friend.`);

            if (!column && column.toString() != "0") {
                return msg.channel.send(this.gridEmbed(game));
            }

            if (column < 1 || column > game.size.width)
                return msg.error(`The column must be a number between 1 and ${game.size.width}.`);
          
            let thisPlayer = (game.lastPlayer == Connect4Player.RED ? game.players.yellow : game.players.red);
            if (msg.author.id != thisPlayer.id)
                return msg.error(`Wait for ${thisPlayer.displayName} to finish their turn!`);
            
            let state = game.move(game.lastPlayer == Connect4Player.RED ? Connect4Player.YELLOW : Connect4Player.RED, column - 1);
            if (state != Connect4State.READY) {
                delete this.games[key];
                let s = "";
                if (state == Connect4State.P1_WIN)
                    s = `${game.players.red}, you won!`;
                if (state == Connect4State.P2_WIN)
                    s = `${game.players.yellow}, you won!`;

                if (state == Connect4State.DRAW)
                    s =`It's a draw!`;
              
                return msg.channel.send(s, { embed: this.gridEmbed(game)});
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
      
        /** @type {[[string, string, boolean?]]} */
        let fields = [
            ["State", Connect4.prettyState(game.state)],
        ]
        
        if (game.state == Connect4State.READY) {
            fields.push(["Next turn", turn, true]);
            fields.push(["Turn after", next, true]);
        }

        return this.client.utils.fastEmbed(
            "Connect Four game",
            game.grid,
            fields
        )
    }
};