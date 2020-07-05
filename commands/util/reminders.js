const Command = require("../../classes/Command");
const { oneLine } = require("common-tags");
const parse = require("parse-duration");
const prettyms = require("parse-ms");

module.exports = class ReminderCommand extends Command {
  constructor(client) {
    super(client, {
      name: "reminders",
      aliases: ["listremind"],
      group: "util",
      memberName: "reminders",
      description: "Lets you see your reminders.",
      examples: [
        "reminders",
        "reminders view",
        "reminders delete 1",
      ],
      args: [
        {
          key: "action",
          oneOf: ["view", "delete"],
          type: "string",
          prompt: "",
          default: "view"
        },
        {
          key: "args",
          type: "string",
          label: "reminder id",
          prompt: "which reminder do you want to identify?",
          default: ""
        }
      ]
    });
  }

  run(msg, { action, args }) {

    if (action == "delete") {
      if (parseInt(args.trim()) == NaN)
        return this.client.utils.sendErrMsg(msg, "The argument to `delete` must be an index number.");
      if (!msg.author.reminders.delete(parseInt(args.trim())))
        return this.client.utils.sendErrMsg(msg, `There's no reminder stored with that ID. A typo?`);
      return this.client.utils.sendOkMsg(msg, `The reminder was successfully deleted.`);
    }

    let embed = this.client.utils.embed()
      .setTitle("Your reminders")
    let desc = [];
    
    console.log(msg.author.reminders.list);
    
    for (let rem of msg.author.reminders.list) {
      let prettyDuration = [];
      var rawObj = prettyms(rem.date - Date.now());
      for (let prop of ["days", "hours", "minutes", "seconds"]) {
        if (rawObj[prop]) prettyDuration.push(this.client.utils.plural(rawObj[prop], prop.substr(0, prop.length-1)));
      }
      prettyDuration = this.client.utils.oxford(prettyDuration);
      
      desc.push(`• ${rem.id}. **${rem.text}** in ${prettyDuration}`);
    }
    
    if (!desc.length) desc.push(`You have no reminders set. Add one with \`${msg.prefix}remindme to do something in 5 minutes\``)
    
    msg.channel.send(embed.setDescription(desc.join("\n")));
  }
};
