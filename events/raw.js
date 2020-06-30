const { Message } = require("discord.js");

module.exports = async (client, packet) => {
  if (["MESSAGE_DELETE"].includes(packet.t)) {
    const channel = await client.channels.fetch(packet.d.channel_id),
          guild   = channel.guild;
    if (channel.messages.cache.has(packet.d.id)) return;
    
    const entry = await guild.fetchAuditLogs({type: 'MESSAGE_DELETE'}).then(audit => audit.entries.first())
    let user = "", av = ""
      if (entry.extra.channel.id === channel.id
        && (entry.createdTimestamp > (Date.now() - 5000))
        && (entry.extra.count >= 1)) {
      user = entry.executor.username
      av = entry.executor.displayAvatarURL()
    } else { 
      user = "themselves"
      av = guild.iconURL()
    }
    
    let e = client.utils.emojis;
    const embed = client.utils.embed()
        // We set the color to a nice yellow here.
        .setColor(15844367)
        .setTitle(e.trash + " A message was deleted")
        .setThumbnail(av)
        .setDescription("**__Uncached message__**") 
        .addField(e.channel + " Channel", `**#${channel.name}** (<#${channel.id}>) [${channel.id}]`)
        .addField(e.id + " Message ID", packet.d.id)
        .setTimestamp(Date.now() - 5000)
        .setFooter(`What a waste!`)
    
    guild.log(embed);
  }
}