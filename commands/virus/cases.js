const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');
const fetch = require('node-fetch');
const cheerio = require('cheerio')

module.exports = class RandTextCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'cases',
      aliases: ['stats', 'cases'],
      group: 'virus',
      memberName: 'cases',
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

  async run(message, args) {
    var body = await fetch('https://www.worldometers.info/coronavirus/')
      .then(res => res.text());
    const $ = cheerio.load(body);
    
    console.log($(".maincounter-number span").first().text());
    
    message.channel.send($(".maincounter-number span").first().text())
  }
};