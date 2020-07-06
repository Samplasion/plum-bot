const Command = require('../../classes/Command.js');
const { oneLine, stripIndent } = require('common-tags');
const Connect4 = require("../../classes/games/Connect4");

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
        key: 'guess',
        prompt: 'what cell do you wanna click on (or, if the game isn\'t started yet, how big should the grid be)?',
        type: 'integer',
        default: ""
      }]
    });

    /** @type {any[]} */
    this.games = []
  }
  
  /**
   * @param {*} msg 
   * @param {object} args 
   * @param {string} [args.guess]
   */
  run(msg, { guess }) {
    let game = new Connect4.Connect4(msg.member, msg.member);
    game.move(Connect4.Connect4Player.RED, 0);
    game.move(Connect4.Connect4Player.YELLOW, 1);
    game.move(Connect4.Connect4Player.RED, 0);
    game.move(Connect4.Connect4Player.YELLOW, 1);
    game.move(Connect4.Connect4Player.RED, 0);
    game.move(Connect4.Connect4Player.YELLOW, 1);
    game.move(Connect4.Connect4Player.RED, 0);
    game.move(Connect4.Connect4Player.YELLOW, 1);
    msg.channel.send("```" + game.grid + "```");
  }
};