const Command = require('./../../classes/PremiumCommand.js');
const p = require("phin");

module.exports = class LyricsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lyrics',
            group: 'audio',
            memberName: 'lyrics',
            description: "Searches for lyrics for the current song, if any, or for a query.",

            args: [{
                key: "query",
                type: "string",
                prompt: "",
                default: ""
            }]
        });
    }

    async run(msg, { query }) {
        let name = "";
        if (query) {
            name = query;
        } else if (msg.guild.queue && msg.guild.queue.length) {
            name = msg.guild.queue[0].songTitle;
        } else return msg.error("This command requires that music be playing or that you enter a query.");

        let res = await p({
            url: "https://some-random-api.ml/lyrics?title=" + encodeURIComponent(name),
            parse: "json"
        });
        let body = res.body;

        if (body.error || !body.lyrics)
            return msg.error(`The lyrics haven't been found! Make sure the title is right and the song isn't unknown.`);
        if (body.lyrics.length > 5999)
            return msg.error("The lyrics are too long! Look for something shorter.")

        let split = body.lyrics.split("\n").reduce((prev, cur) => {
            if (!prev || !prev.length)
                return [ cur ];
            else if (prev.length + "\n".length + cur.length < 1024) {
                prev[prev.length-1] += "\n" + cur;
                return prev;
            }
            prev.push(cur);
            return prev;
        }, []);

        let embed = this.client.utils.embed()
            .setDescription(split[0])
            .setImage(Object.values(body.thumbnail)[0])

        split.shift();

        split.forEach(thing => {
            embed.addField("\u200b", thing);
        })

        msg.channel.send(`**${body.title}**\n_By ${body.author}_`, { embed });
    }
};