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
        label: "column|member",
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
      
      let key = `${msg.member.id}-${member.is}-${msg.guild}`;
      let agree = await member.user.ask(msg.channel, `<@${member.id}>, do you wanna play some Connect 4 with ${msg.member.displayName}?`);

      if (agree) {
        this.games[key] = new Connect4(msg.member, member);
        msg.channel.send(this.games[key].grid);
      }

      return this.client.utils.sendErrMsg(msg, `I'm sorry, ${member.displayName} refused to play with you.`);
    } else {
      /** @type {number} */
      let column = colOrMem;
      let game = this.games[Object.keys(this.games).filter(game => game.endsWith(msg.guild.id)).filter(game => game.includes(msg.author.id))[0]];
      if (!game)
        return this.client.utils.sendErrMsg(msg, `You have no ongoing names! Run \`${msg.prefix}connectfour @Someone\` to play with a friend.`);
      let state = game.move(game.lastPlayer == Connect4Player.YELLOW ? Connect4Player.RED : Connect4Player.YELLOW, column);
      msg.channel.send("```" + game.grid + "```");
      msg.channel.send("```" + state + "```");
    }
  }
};