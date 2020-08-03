const Command = require("../../classes/Command");
const oneLine = require('common-tags').oneLine;

module.exports = class VoteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'vote',
            group: 'util',
            memberName: 'vote',
            description: "Starts a yes/no/don't care vote.",
            details: "Note that :shrug: is \"Don't care\"",
            examples: ['vote "Do you like to vote?" "I mean who doesn\'t right?!" 5'],
            formatExplanation: {
                "<question>": "The question itself",
                "[desc]": "The description of the question",
                "[time]": "The time, **in minutes**, of the vote"
            },
            args: [
                {
                    key: 'question',
                    prompt: 'What is the vote question?',
                    type: 'string'
                },
                {
                    key: 'desc',
                    prompt: '(Optional) Do you have more details?',
                    type: 'string',
                    default: ' '
                },
                {
                    key: 'time',
                    prompt: '(Optional) How long should the vote last in minutes?',
                    type: 'integer',
                    default: 0
                }
            ]
        });
    }

    run(msg, { question, desc, time }) {
        var emojiList = ['👍','👎','🤷'];
        var embed = this.client.utils.embed()
            .setTitle(question)
            .setDescription(desc)
            .setAuthor(msg.author.username, msg.author.displayAvatarURL())
            .setColor(0xD53C55) // Green: 0x00AE86
            .setTimestamp();

        if (time) {
            embed.setFooter(`The vote has started and will last ${this.client.utils.plural(time, "minute")}`)
        } else {
            embed.setFooter(`The vote has started and has no end time`)
        }

        msg.delete(); // Remove the user's command message

        msg.channel.send({embed}) // Use a 2d array?
            .then(async (message) => {
                var reactionArray = [];
                reactionArray[0] = await message.react(emojiList[0]);
                reactionArray[1] = await message.react(emojiList[1]);
                reactionArray[2] = await message.react(emojiList[2]);

                if (time) {
                    setTimeout(() => {
                        // Re-fetch the message and get reaction counts
                        message.channel.messages.fetch(message.id)
                            .then(async  (message) => {
                                var reactionCountsArray = [];
                                for (var i = 0; i < reactionArray.length; i++) {
                                    reactionCountsArray[i] = message.reactions.cache.get(emojiList[i]).count-1;
                                }

                                // Find winner(s)
                                var max = -Infinity, indexMax = [];
                                for(var i = 0; i < reactionCountsArray.length; ++i)
                                    if(reactionCountsArray[i] > max) max = reactionCountsArray[i], indexMax = [i];
                                    else if(reactionCountsArray[i] === max) indexMax.push(i);

                                // Display winner(s)
                                console.log(reactionCountsArray); // Debugging votes
                                var winnersText = "";
                                if (reactionCountsArray[indexMax[0]] == 0) {
                                    winnersText = "No one voted!"
                                } else {
                                    for (var i = 0; i < indexMax.length; i++) {
                                        winnersText +=
                                            emojiList[indexMax[i]] + " (" + this.client.utils.plural(reactionCountsArray[indexMax[i]], "vote") + ")\n";
                                    }
                                }
                                embed.addField("**" + this.client.utils.plural(indexMax.length, "Winner") + "**", winnersText);
                                embed.setFooter(`The vote is now closed! It lasted ${this.client.utils.plural(time, "minute")}`);
                                embed.setTimestamp();
                                message.edit("", embed);
                            });
                    }, time * 60 * 1000);
                }
            })
    }
}