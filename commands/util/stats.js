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
    const elapsed = moment.duration(moment().diff(moment(this.client.user.createdAt))).format("Y [years], D [days], H [hours], m [minutes] [and] s [seconds] [ago]");

    let embed = new Embed(this.client)
      .setTitle("STATISTICS")
      .addFields(
        { name: "⚙️ Memory Usage", value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
        { name: "⏱️ Uptime", value: duration, inline: true },
        { name: "\u200b", value: "\u200b", inline: true },
        { name: "🌍 Users", value: `**• Users**: ${this.client.guilds.cache.reduce((total, server) => total + server.memberCount, 0).toLocaleString()}
**• Channels**: ${this.client.channels.cache.size.toLocaleString()}
**• Servers**: ${this.client.guilds.cache.size.toLocaleString()}`, inline: true },
        { name: "🔢 Versions", value: `**• Discord.js**: v${version}
**• Node.js**:    ${process.version}`, inline: true },
        { name: "🎂 Creation date", value: elapsed, inline: false },
      )
    
    message.channel.send(embed);
  }
}