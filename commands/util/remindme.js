const Command = require("../../classes/Command");
const { oneLine } = require("common-tags");
const parse = require("parse-duration");
const prettyms = require("parse-ms");

module.exports = class ReminderCommand extends Command {
  constructor(client) {
    super(client, {
      name: "remindme",
      aliases: ["remind"],
      group: "util",
      memberName: "remindme",
      description: "Sets a reminder so that you don't forget something _really_ important.",
      examples: ["remindme to go buy groceries in 30 minutes"],
      format: '<text> in <duration>',
      formatExplanation: {
        "<text>": "The name of your reminder",
        "in <duration>": "In how much time to remind you of `text`."
      },
      args: [
        {
          key: "text",
          type: "string",
          prompt: "what do you want me to remind you of, and when?"
        }
      ]
    });
  }

  run(msg, { text }) {
    let reminder = text.split(/\bin\b/g);
    if (reminder.length < 2)
      return this.client.utils.sendErrMsg(
        msg,
        oneLine`You didn't enter a duration.
To enter a duration, type \`in <duration>\` after the reminder, in a new message, like so:
\`${msg.prefix}remindme to do something in 5 minutes\`.`
      );

    let duration = parse(reminder.pop());
    if (!duration || duration < 5000 || duration > 604800000)
      // 1 week
      return this.client.utils.sendErrMsg(
        msg,
        `You entered an invalid duration.`
      );

    reminder = reminder.join("in");
    if (!reminder.length)
      return this.client.utils.sendErrMsg(
        msg,
        `You have to enter something to remind you of.`
      );

    let prettyDuration = [];
    var rawObj = prettyms(duration);
    for (let prop of ["days", "hours", "minutes", "seconds"]) {
      if (rawObj[prop]) prettyDuration.push(this.client.utils.plural(rawObj[prop], prop.substr(0, prop.length-1)));
    }

    msg.say(
      `Alright! I'll remind you ${reminder.trim()} in ${this.client.utils.oxford(
        prettyDuration
      )}.`
    );

    let remObj = {
      text: reminder.trim(),
      date: Date.now() + duration,
      userID: msg.author.id,
      id: (((msg.author.reminders.list || [])[(msg.author.reminders.list || [""]).length-1] || {id:0}).id || 0) + 1
    };

    msg.author.reminders.add(remObj);

    this.client.reminders.raw[msg.author.id] = (this.client.reminders.raw[msg.author.id] || []);
    this.client.reminders.raw[msg.author.id][remObj.id] = setTimeout(() => {
      this.client.utils.remindUser(msg.author, remObj);
      msg.author.reminders.flush();
    }, duration);
  }
};
