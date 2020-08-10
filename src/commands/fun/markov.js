const Command = require('../../classes/commands/Command.js');
const { oneLine } = require("common-tags");

module.exports = class MarkovCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'markov',
            aliases: [],
            group: 'fun',
            memberName: 'markov',
            description: "Generates a Markov chain based on the messages in this channel (if you specify a user, only their messages will be counted)",
            args: [{
                key: "user",
                type: "member",
                default: "",
                prompt: "",
            }],
            format: "[user] [--channel=\"channel\"]",
            formatExplanation: {
                '[user]': "A user to filter the messages of. (Allows for more personal results)",
                '[--channel="channel"]': "The channel to gather the data from."
            }
        });
    }

    async run(msg, { user }) {
        console.log(user);
        if (user.bot)
            user = "";
        
        msg.channel.startTyping();

        let channel = msg.flags.channel && typeof msg.flags.channel == "string" && msg.guild.channels.cache.has(msg.flags.channel) ? msg.guild.channels.cache.get(msg.flags.channel) : msg.channel;
        
        const source = (await channel.fetchMessages({ limit: 1000 })).filter(m => {
            let res = (user ? m.author.id == user.id : true) && !!msg.cleanContent.trim() && !m.author.bot;
            return res;
        }).map(m => m.cleanContent.split(/\b/g).filter(s => !!s.trim())).reverse().flat().join("\n");        
        const order = msg.flags.order && typeof msg.flags.order == "number" ? msg.flags.order.clamp(1, 2) : 2;

        const markov = require('markov')(order);
        markov.seed(source);

        let msgs = [...channel.messages.cache.array()];
        let result;
        try {
            result = markov.respond(msgs.sort((a, b) => a.cleanContent.length - b.cleanContent.length)[0].cleanContent);
        } catch {
            return msg.error("The Markov message couldn't be constructed.");
        }
        
        let [{ value: desc }, ...fields] = this.client.utils.embedSplit(result.join(" "), "\n", " ");

        let embed = msg.makeEmbed()
            .setTitle("Markov chain")
            .setDescription(desc)
            .addFields(fields)
            .addField("Channel", `${channel} (#${channel.name})`)
        
        msg.channel.stopTyping();
        
        return msg.channel.send(embed)
    }
};