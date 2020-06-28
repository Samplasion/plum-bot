const Command = require('./../../classes/Command.js');
const { oneLine } = require('common-tags');
const List = require('list-array');
const Embed = require('../../classes/Embed');
const Game = require('hangman-game-engine');
function random(a, b = 0) {
    var max = Math.max(a, b),
        min = Math.min(a, b)
    return ~~(Math.random() * (max - min) + min)
}

module.exports = class HangmanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hangman',
      group: 'fun',
      aliases: ["hman"],
      memberName: 'hangman',
      description: 'Play some "Hangman" with a bot!',
      examples: ['hman', "hman g"],
      args: [{
        key: 'guess',
        prompt: 'what letter do you wanna guess?',
        type: 'string',
        default: ""
      }]
    });
    this.games = []
  }

  run(msg, { guess: action }) {// try {
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