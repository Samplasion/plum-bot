const Command = require("../../classes/Command");
const {
    oneLine
} = require("common-tags");
const parse = require("@standards/duration");

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
            format: "[\"view\"|\"delete\"] (reminder id) [--relative|--rel]",
            formatExplanation: {
                '["view"|"delete"]': "Either `view` or `delete`. Defaults to `view`",
                "[reminder id]": "If `action` is `delete`, the ID of the reminder to delete.",
                "[--relative|--rel]": oneLine`If this is present and \`action\` is \`view\`, shows
                    how much time is until a reminder, instead of the reminder time.`
            },
            args: [{
                    key: "action",
                    oneOf: ["view", "delete"],
                    type: "string",
                    label: "\"view\"|\"delete\"",
                    prompt: "",
                    default: "view",
                    parse: (val) => val.toLowerCase()
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
            let time;
            if (msg.flag("relative", "rel")) {
                let prettyDuration = humanize(rem.date - Date.now());

                time = `in ${prettyDuration}`
            } else {
                let date = new Date(rem.date);
                time = `- ${this.client.utils.fmtDate(date)}`;
            }

            desc.push(`• ${rem.id}. **${rem.text.replace(/(^\*\*|\*\*$)/g, "")}** ${time}`);
        }

        if (!desc.length) desc.push(`You have no reminders set. Add one with \`${msg.prefix}remindme to do something in 5 minutes\``)

        msg.channel.send(embed.setDescription(desc.join("\n")));
    }
};
