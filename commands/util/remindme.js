const { Command } = require('discord.js-commando');
const parse = require('parse-duration');

module.exports = class ReminderCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remindme',
      aliases: ['remind'],
      group: 'util',
      memberName: 'remindme',
      description: 'Lets you see your permission level.',
      examples: ['perms'],
      args: [
        {
          key: "text",
          type: "string",
          prompt: "what do you want me to remind you of, and when?",
          default: ""
        }
      ]
    });
  }

  run(message, { text }) {
    var duration = parse(text.split("in")[1]);
    if (!duration)
      return this.client.util.errorMsg(`You entered an invalid duration`);
  }
};