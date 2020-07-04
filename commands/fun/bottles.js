const Command = require('./../../classes/Command.js');

module.exports = class BeerCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bottles',
      group: 'fun',
      aliases: ["beer"],
      memberName: 'bottles',
      description: '99 bottles of beer on the wall, 99 bottles of beer...',
      details: "The number of bottles must be max 99",
      examples: ['bottles 10', 'bottles 99'],
      args: [
        {
          key: 'beer',
          label: 'bottles',
          prompt: 'how many bottles do you wanna drink?',
          type: 'integer',
          max: 99,
          min: 1,
        }
      ],
      throttling: {
        usages: 2,
        duration: 60
      },
    });    
  }
  
  async run(msg, { beer }) {
    var string = ""
    for (var i = beer; i > 0; i--) {
      var bottles = i == 1 ? "bottle" : "bottles"
      string += `${i} ${bottles} of beer on the wall, ${i} ${bottles} of beer.\nTake one down, pass it around, ${i-1 == 0 ? "no more bottles" : this.client.utils.plural(i-1, "bottle")} of beer on the wall...\n`
    }
    msg.channel.send(string, { split: true })
  }
};