const Command = require("../../classes/Command");
const { oneLine } = require('common-tags');

module.exports = class LeaderboardCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'leaderboard',
            aliases: ["lb"],
            group: 'fun',
            memberName: 'leaderboard',
            description: 'Know your way (to dem max points)',
            examples: ['leaderboard'],
            guildOnly: true,
            args: [
              {
                key: "num",
                prompt: "how many users should this leaderboard contemplate?",
                type: "integer",
                default: 5,
                validate: num => {
                  if (num >= 3 && num <= 10) return true;
                  return `the number you entered is too ${num < 3 ? "low" : "high"}. It must be between 3 and 10 including them.`
                }
              }
            ]
        });
    }

    async run(message, { num }) {
      /*
      // Get a filtered list (for this guild only), and convert to an array while we're at it.
      const filtered = this.client.points.array().filter(p => p.guild === message.guild.id);

      // Sort it to get the top results... well... at the top. Y'know.
      const sorted = filtered.sort((a, b) => a.points < b.points);

      // Slice it, dice it, get the top 10 of it!
      const top10 = sorted.splice(0, num);*/
      
      // thank NYoshi for this (I don't know why it didn't work before)
      var filtered = this.client.points.array().filter(p => p.guildID === message.guild.id);
			var sorted = filtered.sort((a, b) => b.points - a.points);
			var top10 = sorted.splice(0, num);
      
      console.log(filtered, sorted, top10)

      // Now shake it and show it! (as a nice embed, too!)
      const embed = this.client.utils.embed()
        .setTitle("Leaderboard")
        .setDescription("Our top " + top10.length + " of point leaders!")
        //.setColor(0x00AE86);
      
      if (!top10.length) {
        return message.channel.send(embed.setDescription("The leaderboard's empty; it's you chance to rise and shine!"));
      }

			// console.log(top10);
      var counter = 1;
			for(const lbdata of top10) {
				if(!message.guild.members.cache.has(lbdata.userID)) {
          console.log(lbdata);
          continue;
        }
				try {
					embed.addField(`**${counter}.** ${this.client.users.cache.get(lbdata.userID).tag}`, `${lbdata.points} points (level ${lbdata.level})`);
				} catch(e) {
					console.log(e)
				}
        counter++;
			}
      
      /*
      for(const data of top10) {
        embed.addField(this.client.users.get(data.user).tag, `${data.points} EXP points (level ${data.level})`);
      }*/
      
      return message.embed(embed);
    }
};