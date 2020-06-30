const Command = require('./../../classes/Command.js');
const { oneLine } = require('common-tags');
const List = require('list-array');
const Embed = require('../../classes/Embed');
const minesweeper = require('minesweeper');
function random(a, b = 0) {
    var max = Math.max(a, b),
        min = Math.min(a, b)
    return ~~(Math.random() * (max - min) + min)
}
function roundNumber(num, scale) {
  if(!("" + num).includes("e")) {
    return +(Math.round(num + "e+" + scale) + "e-" + scale);
  } else {
    var arr = ("" + num).split("e");
    var sig = ""
    if(+arr[1] + scale > 0) {
      sig = "+";
    }
    return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
  }
}

var BoardStateEnum = minesweeper.BoardStateEnum;
var CellStateEnum = minesweeper.CellStateEnum;
var CellFlagEnum = minesweeper.CellFlagEnum;
var Board = minesweeper.Board;
var Cell = minesweeper.Cell;
var generateMineArray = minesweeper.generateMineArray;

module.exports = class HangmanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'minesweeper',
      group: 'fun',
      aliases: ["ms"],
      memberName: 'minesweeper',
      description: 'Play some "Minesweeper" with a bot!',
      examples: ['hman', "hman g"],
      args: [{
        key: 'guess',
        prompt: 'what cell do you wanna click on (or, if the game isn\'t started yet, how big should the grid be)?',
        type: 'string',
        default: ""
      }]
    });
    this.games = []
  }
  
  run(msg, { guess }) {
    let regex = /(\d+)\s*(?:\.|\*|x|-|\||_|&)\s*(\d+)\s*(\?|!)?/gm;
    let   key = `${msg.guild.id}${msg.author.id}`;
    
    if (!regex.test(guess))
      return this.client.util.sendErrMsg(msg, "The guess (or board size) isn't in an appropriate format. Check the help page for more info.");
    
    let data = regex.exec(guess);

    if (this.games[key]) {
      
    } else {
      var mineArray = minesweeper.generateMineArray({
        rows: 5,
        cols: 5,
        mines: 5
      });

      var board = new Board(mineArray);

      this.games[key] = board;
    }
    
    var printBoard = function (board) {
      var i,
          strColHead = '   ',
          grid = board.grid();

      // print a header that shows the column numbers 
      for (i = 0; i < board.numCols(); i++) {
        strColHead += '   ' + i + '   ';
      }
      let head = strColHead;
      let body = [];

      // print all the rows on the board
      for (i = 0; i < board.numRows(); i++) {
        printRow(grid[i], i);
      }
    };

    var printRow = function (rowArray, rowNum) {
      var i,
          cell,
          strRow = '';

      // Start the row with the row number
      strRow += rowNum !== undefined ? ' ' + rowNum + ' ' : '';

      // Add each cell in the row to the string we will print
      for (i=0; i<rowArray.length; i++) {
        cell = rowArray[i];
        if (cell.state === CellStateEnum.CLOSED) {
          if (cell.flag === CellFlagEnum.NONE) {
            strRow += getCellString(' ');
          } else if (cell.flag === CellFlagEnum.EXCLAMATION) {
            strRow += getCellString('!');
          } else if (cell.flag === CellFlagEnum.QUESTION) {
            strRow += getCellString('?');
          }
        } else if (cell.state === CellStateEnum.OPEN) {
          if (cell.isMine) {
            strRow += getCellString('*');
          } else {
            strRow += getCellString(cell.numAdjacentMines);
          }
        }
      }

      // Print this row to the console
      return strRow;
    };

    var getCellString = function (content) {
      return ' [ ' + content + ' ] ';
    };

    var mineArray = minesweeper.generateMineArray({
        rows: 5,
        cols: 5,
        mines: 5
    });

    var board = new Board(mineArray);
    
    this.games[key] = board;
    
    printBoard(board);
  }

  run_(msg, { guess: action }) {// try {
    action = action.toLowerCase()
    var game;
    const key = `${msg.guild.id}${msg.author.id}`
    let shouldMove = /[a-z]/gmi.test(action)
    if (!this.games[key]) shouldMove = false
    if (!shouldMove) {
      if (this.games[key]) {
        let game = this.games[key]
        const [fAtt, rAtt] = [game.failedGuesses, game.config.maxAttempt-game.failedGuesses]
        let e = new Embed(this.client)
          .setAuthor(msg.member.displayName, msg.author.displayAvatarURL)
          .setTitle("Showing Hangman game")
          .setDescription(`\`\`\`${game.hiddenWord.join("")}\`\`\``)
          .addInline("Failed Guesses", fAtt)
          .addInline("Remaining Attempts", rAtt)
          .addField("Guessed letters", game.guessedLetters.join(", ") || "None")
          .addInline("Right guesses", game.guessedLetters.filter(gl => game.hiddenWord.map(l => l.toLowerCase()).includes(gl)).join(", ") || "None")
          .addInline("Wrong guesses", game.guessedLetters.filter(gl => !game.hiddenWord.map(l => l.toLowerCase()).includes(gl)).join(", ") || "None")

        return msg.channel.send(e)
      }
      const words = require("./../../hangman.js")
      let word = words.random()
      game = new Game(word, {maxAttempt: 6})
      // if (this.client.settings.get(msg.guild.id, "hangmanHint")) {
      var letters = List.fromArray(word.split(""))
      List.of(letters.first, letters.last).uniq().forEach(letter => game.guess(letter))
      // }
      let e = new Embed(this.client)
        .setAuthor(msg.member.displayName, msg.author.displayAvatarURL)
        .setTitle("Showing Hangman game")
        .setDescription(`\`\`\`${game.hiddenWord.join("")}\`\`\``)
      msg.channel.send(e)
      this.games[key] = game
      return
    }
    action = action[0]
    game = this.games[key]
    if (!game) return this.run(msg, {guess: "new"})
    if (game.guessedLetters.includes(action))
      return msg.channel.send(
        new Embed(this.client)
          .setColor("RED")
          .setAuthor(msg.member.displayName, msg.author.displayAvatarURL)
          .setTitle("Hangman game error")
          .setDescription("You've already guessed that letter")
      );
    game.guess(action)
    
    if (game.status != "IN_PROGRESS") {
      delete this.games[key]
      let e = new Embed(this.client)
        .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
        .setTitle("Hangman game results")
      let d = ""
      let c = random(1, 3)
      if (game.status == "WON") {
        d +=`You won ¥${c}!\n`
        // this.client.points.math(`${msg.guild.id}-${msg.author.id}`, "+", c, "coins")
      } else {
        d += `You lost ¥${c}!\n`
        // this.client.points.math(`${msg.guild.id}-${msg.author.id}`, "-", c, "coins")
      }
      d +=`The word was: **${game.word}**`
      e.setDescription(d)
      return msg.channel.send(e)
    }
    
    this.games[key] = game
    const [fAtt, rAtt] = [game.failedGuesses, game.config.maxAttempt-game.failedGuesses]
    
    let e = new Embed(this.client)
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL)
      .setTitle("Showing Hangman game")
      .setDescription(`\`\`\`${game.hiddenWord.join("")}\`\`\``)
      .addField("Failed Guesses", fAtt, true)
      .addField("Remaining Attempts", rAtt, true)
      .addField("Guessed letters", game.guessedLetters.join(", ") || "None")
      .addField("Right guesses", game.guessedLetters.filter(gl => game.hiddenWord.map(l => l.toLowerCase()).includes(gl)).join(", ") || "None", true)
      .addField("Wrong guesses", game.guessedLetters.filter(gl => !game.hiddenWord.map(l => l.toLowerCase()).includes(gl)).join(", ") || "None", true)
    
    msg.channel.send(e)
    
  // } catch(e){console.error(e)}}
  }
};