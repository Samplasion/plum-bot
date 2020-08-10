module.exports = async (client, guild) => {
  client.utils.log(`${client.utils.emojis.server} Server joined`, `${guild.name}[${guild.id}]`);
  guild.config.setDefaultSettings();
}