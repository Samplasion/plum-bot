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
    
    var tot = $(".maincounter-number span");
    var cases = tot.first().text();
    var deaths = tot.eq(1).text();
    var recoveries = tot.eq(2).text();
    
    var cases_tot = $(".number-table-main");
    var inf = cases_tot.eq(0).text();
    var closed = cases_tot.eq(1).text();
    
    message.channel.send(`**___Coronavirus Stats___**

**Total cases**: ${cases}cases, of which:
  • ${inf} are currently infected.
  • ${closed} either recovered or were killed; particularly:
     - ${deaths} people were killed by the virus.
     - ${recoveries} people recovered from it.
`)
  }
};