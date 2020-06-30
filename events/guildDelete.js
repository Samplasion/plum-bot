module.exports = async (client, guild) => {
  client.utils.log(`${client.utils.emojis.server} Server left`, `${guild.name}[${guild.id}]`);
  guild.config.setDefaultSettings();
}