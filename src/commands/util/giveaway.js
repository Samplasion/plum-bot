// @ts-nocheck
const Command = require('../../classes/commands/Command.js');
const { oneLine } = require("common-tags");
const parse = require('@standards/duration');
 
module.exports = class GiveawayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'giveaway',
            aliases: ["ga"],
            group: 'util',
            memberName: 'giveaway',
            description: "Creates a giveaway in your channel.",
            details: oneLine`Most of the actions of this command require a Message ID.
            If you don't know how to get it, [you can find a guide here](${process.env.DOMAIN}/getting-ids).`,
            args: [
               {
                   key: "action",
                   label: '"create"|"edit"|"reroll"|"cancel"|"postpone"',
                   type: "string",
                   prompt: "",
               },
               {
                   key: "item",
                   label: "item|id",
                   type: "string",
                   prompt: "",
               },
            ],
            permLevel: 2,
            format: '<"create"|"edit"|"reroll"|"cancel"|"postpone"> <item|id> (--duration="duration") [--winners="number"] [--perm="max permission level 1-4"] [--item="prize"]',
            formatExplanation: {
                '<"create"|"edit"|"reroll"|"cancel"|"postpone">': "The action to execute.",
                "<item|id>": "If the action is `create`, a prize (anything), otherwise a Message ID",
                '(--duration="duration")': oneLine`If the action is \`create\`, the duration for the new giveaway.
                    If the action is \`postpone\`, the time to postpone the giveaway (that is, how much
                    more or less time the giveaway will last, for example \`10m\` or \`-50s\` for less time)`,
                '[--winners="number"]': oneLine`If the action is \`create\` or \`edit\`, the number of people
                    that will get rolled for the giveaway.`,
                '[--perm="max permission level 1-4"]': `If the action is \`create\` or \`edit\`, the maximum
                    permission level that can win the giveaway (that is, the level that shows in the square
                    brackets when you run the \`perms\` command. For example, if this is 1 (as per the default),
                    then the moderators, the admins and the owner(s) wouldn't be able to win the giveaway as their
                    levels would be respectively 2, 3 and 4).`,
                '[--item="prize"]': "If the action is `edit`, the new prize of the giveaway."
            },
            examples: [
                'create "$30 Steam Card" --duration="1 day"',
                'create "$30 Steam Cards" --duration="1 day" --winners=2',
                'create "$30 Steam Card (staff allowed)" --duration="1 day" --perm=4',
                'edit MESSAGE_ID --item="$20 Steam Card"',
                'edit MESSAGE_ID --winners=2',
                'reroll MESSAGE_ID',
                'reroll MESSAGE_ID --winners=2',
                'cancel MESSAGE_ID',
                'postpone MESSAGE_ID --duration="5 hours"',
                'postpone MESSAGE_ID --duration="-5 hours"',
            ].map(s => `giveaway ${s}`)
        });

        this.values = ["create", "edit", "reroll", "cancel", "postpone"];
    }
 
    async run(msg, { action, item }) {
        action = `${action.toLowerCase()}`;

        if (!this.values.includes(action))
            return msg.error(`That action doesn't exist. It must be one of the following: ${this.values.map(s => `\`${s}\``).join(", ")}`);

        if (action == "create")
            return this.create(msg, item);

        return this.handleIDs(msg, action, item);
    }

    async create(msg, prize) {
        let flags = ["duration"];
        if (!flags.every(f => msg.flags[f]))
            return msg.error(`The following flags must all be present: ${flags.map(s => `\`${s}\``).join(", ")}`);

        let d = msg.flags.duration;
        if (typeof d != "string")
            return msg.error("The `duration` flag must be a string.");

        let time = parse(d);
        if (!time)
            return msg.error("You entered an invalid duration.");

        let winners = 1
        if (msg.flags.winners && typeof msg.flags.winners == "number")
            winners = msg.flags.winners;

        let maxPerm = 1;
        if (msg.flags.perm && typeof msg.flags.perm == "number")
            maxPerm = msg.flags.perm.clamp(1, 4);
        
        this.client.giveaways.start(msg.channel, {
            prize,
            time: time.clamp(5000, 7 * 24 * 60 * 60 * 1000),
            winnerCount: winners,
            exemptMembers: (member) => member.level.level <= maxPerm,
            messages: {
                giveaway: "🎉🎉 **GIVEAWAY** 🎉🎉",
                giveawayEnded: "🎉🎉 **GIVEAWAY ENDED** 🎉🎉",
                endedAt: "Ending time",
                embedFooter: this.client.user.username,
                units: {
                    days: "days",
                    hours: "hours",
                    minutes: "minutes",
                    seconds: "seconds",
                    pluralS: false
                },
                timeRemaining: "**{duration}** left",
                inviteToParticipate: "React with 🎉 to participate.",
                winMessage: "Congrats, {winners}! You won **{prize}**.",
                noWinner: "No valid participants were found so the giveaway has been closed without winners.",
                winners: "winner(s)",
                hostedBy: "Hosted by {user}"
            },
        });
    }

    async handleIDs(msg, action, id) {
        let gas = this.client.giveaways.giveaways;
        let help = "";
        let lastGa = gas.filter(ga => ga.guildID == msg.guild.id && !ga.ended).sort((ga1, ga2) => {
            return ga1.startAt - ga2.startAt;
        })[0];
        if (lastGa) {
            help = `If you need help, the last giveaway ID is \`${lastGa.messageID}\`.`;
        }
        if (!gas.map(ga => ga.messageID).includes(id)) {
            let combined = [
                {
                    type: "error",
                    message: "That ID isn't a giveaway, or isn't a message."
                }
            ];
            if (help)
                combined.push({
                    type: "info",
                    message: help
                });
            return msg.combine(combined);
        }

        return this[action](msg, id);
    }

    async edit(msg, id) {
        let old = this.client.giveaways.giveaways.filter(g => g.messageID == id)[0];

        if (old.ended) {
            return msg.error("That giveaway is already over!");
        }

        let flags = ["item", "winners", "time"];
        if (!msg.flag(...flags))
            return msg.error(`At least one of the following flags must be present: \`${flags.join("`, `")}\``);

        let prize = msg.flags.item;
        if (!["string", "number"].includes(typeof prize))
            return msg.error("The `item` flag must be present a valid string of text.");

        let winners = undefined;
        if (msg.flags.winners && typeof msg.flags.winners == "number")
            winners = msg.flags.winners;
        
        let d = undefined;
        if (msg.flags.time && typeof msg.flags.time == "number") {
            let lower = 5000;
            let upper = (7 * 24 * 60 * 60 * 1000) - old.remainingTime;
            d = msg.flags.time;
            let time = parse(d);
            if (!time)
                return msg.error("You entered an invalid duration.");
            d = time.clamp(Math.min(lower, upper), Math.max(lower, upper))
        }

        await this.client.giveaways.edit(id, {
            newPrize: `${prize}`,
            newWinnerCount: winners,
            // addTime: d
        });

        return msg.ok("Alright! The giveaway will be updated on its next update (every 10 seconds)");
    }

    async reroll(msg, id) {
        let old = this.client.giveaways.giveaways.filter(g => g.messageID == id)[0];

        if (!old.ended) {
            return msg.error("That giveaway is not over! You can wait for it to roll normally, or postpone it with a negative duration.");
        }

        let winners = undefined;
        if (msg.flags.winners && typeof msg.flags.winners == "number")
            winners = msg.flags.winners;

        await this.client.giveaways.reroll(id, {
            winnerCount: winners,
        });
    }

    async cancel(msg, id) {
        let old = this.client.giveaways.giveaways.filter(g => g.messageID == id)[0];

        if (old.ended) {
            return msg.error("That giveaway is already over!");
        }

        await this.client.giveaways.delete(id, true);

        return msg.ok("The giveaway has been cancelled.")
    }

    async postpone(msg, id) {
        let old = this.client.giveaways.giveaways.filter(g => g.messageID == id)[0];

        if (old.ended) {
            return msg.error("That giveaway is already over!");
        }

        let d = msg.flags.duration;
        if (typeof d != "string")
            return msg.error("The `duration` flag must be a string.");

        let time = parse(d);
        if (!time)
            return msg.error("You entered an invalid duration.");

        let week = 7 * 24 * 60 * 60 * 1000;
        time = time.clamp(-old.remainingTime, week - old.remainingTime)

        await this.client.giveaways.edit(id, {
            addTime: time
        });

        return msg.ok("The giveaway has been postponed. You'll see the changes in the next update.");
    }
};