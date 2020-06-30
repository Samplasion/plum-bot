const { Message } = require("discord.js");

module.exports = async (client, packet) => {
  if (["MESSAGE_DELETE"].includes(packet.t)) {
    const channel = await client.channels.fetch(packet.d.channel_id),
          guild   = channel.guild;
    if (channel.messages.cache.has(packet.d.id)) return;
    
    console.dir(packet.d);
    
    let m = new Message(client, packet.d, channel);
    m.content = "Uncached message";
    m.author = {
      id: "",
      
    }
    
    client.emit("messageDelete", m);
  }
}