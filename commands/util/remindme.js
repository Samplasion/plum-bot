const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');
const parse = require('parse-duration');
const prettyms = require('parse-ms');

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

  run(msg, { text }) {
    let reminder = text.split(/\bin\b/g);
    if (reminder.length < 2) 
      return this.client.utils.sendErrMsg(msg, oneLine`You didn't enter a duration.
To enter a duration, type \`in <duration>\` after the reminder.`);
    
    let duration = parse(reminder.pop());
    if (!duration || duration < 5000 || duration > 604800000) // 1 week
      return this.client.utils.sendErrMsg(msg, `You entered an invalid duration.`);
    
    reminder = reminder.join("in");
    if (!reminder.length) 
      return this.client.utils.sendErrMsg(msg, `You have to enter something to remind you of.`);
    
    let prettyDuration = [];
    var rawObj = prettyms(duration);
    for (let prop of ["days", "hours", "minutes", "seconds", "milliseconds"]) {
      if (rawObj[prop]) prettyDuration.push(`${rawObj[prop]} ${prop}`);
    }
    
    msg.say(`Alright! I'll remind you ${reminder}in ${this.client.utils.oxford(prettyDuration)}.`);
    
    setTimeout(() => {
      this.remindUser(msg.author, {
        text: reminder.trim()
      });
    }, duration);
  }
  
  remindUser(user, reminder) {
    return user.send(`:bulb: You asked me to remind you ${reminder.text}.`);
  }
};