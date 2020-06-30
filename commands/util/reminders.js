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
      examples: ["reminders"],
      args: []
    });
  }

  run(msg) {
    let embed = this.client.utils.embed()
      .setTitle("Your reminders")
    let desc = [];
    
    for (let rem in msg.author.reminders.list) {
      let prettyDuration = [];
      var rawObj = prettyms(rem.date - Date.now());
      for (let prop of ["days", "hours", "minutes", "seconds", "milliseconds"]) {
        if (rawObj[prop]) prettyDuration.push(this.client.util.plural(rawObj[prop], prop.substr(-1)));
      }
      prettyDuration = this.client.utils.oxford(prettyDuration);
      
      desc.push(`• ${rem.id} Reminder **${rem.text}** in ${prettyDuration}`);
    }
    
    if (!desc.length) desc.push(`You have no reminders set. Add one with ``)
    
    msg.channel.send(embed.setDescription(desc.join("\n")));
  }
};
