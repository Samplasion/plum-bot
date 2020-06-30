module.exports = (client, msgs) => {
  let msg = msgs.first()
  const size = msgs.size;
  let em = client.utils.emojis;
  let e = client.utils.embed()
    .setTitle(em.trash + " A message purge just happened")
    .setThumbnail(client.user.displayAvatarURL())
    .setColor(0xC61919)
    .setDescription(`${client.utils.plural(size, "message")} ${size == 1 ? "was" : "were"} deleted`)
    .addField(em.channel + " Channel", `**#${msg.channel.name}** (<#${msg.channel.id}>) [${msg.channel.id}]`)
    .setFooter("So much waste, smh...")
  msg.guild.log(e);
}