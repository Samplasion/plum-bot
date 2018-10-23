const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');

module.exports = class RandTextCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'random',
      aliases: ['randtext', 'randstring', 'randomtext', 'passwordgenerator', 'randgen'],
      group: 'fun',
      memberName: 'random',
      description: 'Generates a random string according to the length you specify.',
      details: oneLine`
        Do you need some random letters? Do you just like making nonsense?
        This command generates a random string of letters and numbers according
        to the length you specify.
			`,
      examples: ['random 15'],
      args: [{
        key: 'toRand',
        label: 'random text length',
        prompt: 'How long would you like the message to be?',
        type: 'integer',
        default: 10,
        parse: it => {
          return it > 2000 
            ? 2000 
            : (it < 10 
              ? 10
              : it)
        }
      }]
    });
  }

  run(message, args) {
    function randomtext() {
      let text = '';
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?@#$%^&()-_=+/|{}"\'';

      for (let i = 0; i < args.toRand; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }

    const random = randomtext();
    message.channel.send(require("discord.js").Util.escapeMarkdown(random).substr(0, 2000))
  }
};