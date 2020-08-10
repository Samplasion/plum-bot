const Command = require("../../classes/commands/Command");
const {
    oneLine
} = require("common-tags");
const parse = require("@standards/duration");
const Timer = require("../../classes/Timer");

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
            args: [{
                key: "text",
                type: "string",
                prompt: "what do you want me to remind you of, and when?"
            }]
        });
    }

    run(msg, {
        text
    }) {
        let reminder = text.split(/\bin\b/g);
        if (reminder.length < 2)
            return msg.error(oneLine `You didn't enter a duration.
To enter a duration, type \`in <duration>\` after the reminder, in a new message, like so:
\`${msg.prefix}remindme to do something in 5 minutes\`.`);

        let duration = parse(reminder.pop());
        if (!duration)
            // 1 week
            return msg.error(`You entered an invalid duration.`);

        if (duration < 5000 || duration > (msg.author.isPremium ? 31 * 24 * 60 * 60 * 1000 : 604800000))
            return msg.error(msg.author.isPremium ? oneLine`The
            duration for Premium users must be between 5 seconds and 1 month.` : oneLine`The
            duration for normal users must be between 5 seconds and 1 week.
            **Update to Premium for an extended duration of 1 month!** Use the \`${msg.prefix}premium\`
            command to know how.`)

        reminder = reminder.join("in");
        if (!reminder.length)
            return msg.error(`You have to enter something to remind you of.`);

        let prettyDuration = humanize(duration);

        msg.ok(
            `Alright! I'll remind you ${reminder.trim()} in ${prettyDuration}.`
        );

        let remObj = {
            text: reminder.trim(),
            date: Date.now() + duration,
            userID: msg.author.id,
            id: (((msg.author.reminders.list || [])[(msg.author.reminders.list || [""]).length - 1] || {
                id: 0
            }).id || 0) + 1
        };

        msg.author.reminders.add(remObj);

        this.client.reminders.raw[msg.author.id] = (this.client.reminders.raw[msg.author.id] || []);
        this.client.reminders.raw[msg.author.id][remObj.id] = new Timer(Date.now() + duration, () => {
            this.client.utils.remindUser(msg.author, remObj);
            msg.author.reminders.flush();
        });
    }
};
