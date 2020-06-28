const Command = require("../../classes/Command");
const { version } = require("discord.js");
const moment = require("moment");
const Embed = require("../../classes/Embed");
require("moment-duration-format");

module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: "stats",
      group: "util",
      memberName: "stats",
      description: "Shows some stats of the bot.",
      details: "Shows stats such as uptime, memory usage and Discord.js version.",
      ownerOnly: true,

      args: []
    });
  }
  
  async run(message, args, level) { // eslint-disable-line no-unused-vars
    const duration = moment.duration(this.client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
    
    let embed = new Embed(this.client)
      .setTitle("STATISTICS")
      .addFields(
        { name: "⚙️ Memory Usage", value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
        { name: "⏱️ Uptime", value: duration, inline: true },
        { name: "🌍 Users", value: this.client.users.cache.size.toLocaleString(), inline: true },
        { name: "Servers", value: this.client.guilds.cache.size.toLocaleString(), inline: true },
        { name: "Channels", value: this.client.channels.cache.size.toLocaleString(), inline: true },
        { name: "🔢 Versions", value: `• Discord.js: v${version}\n• Node.js:    ${process.version}`, inline: true }
      )
    
    message.channel.send(embed);
  }
}