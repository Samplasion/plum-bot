const { Message } = require("discord.js");

module.exports = async (client, packet) => {
  if (["MESSAGE_DELETE"].includes(packet.t)) {
    const channel = await client.channels.fetch(packet.d.channel_id),
          guild   = channel.guild;
    if (channel.messages.has(packet.d.id)) return;
    
    client.emit("messageDelete", new Message(client, packet.d, channel))
  }
}