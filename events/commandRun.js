module.exports = async (client, command, promise/* <Message> */, message/* <prefix><command> <args> */, args, isCommandPattern) => {
  var cmdArgs = []
  if (args instanceof Array) cmdArgs = args
  else if (args instanceof String) cmdArgs = [args]
  else cmdArgs = Object.values(args)
  var botMsg = await promise || null
  var guild = message.guild
  if (!message.guild) guild = { name: "Direct Messages", id: client.user.id }
  console.log(`  [CMD] ${message.command.name}(${cmdArgs.join(", ")}) [${botMsg ? global.roundNumber((botMsg.createdAt - message.createdAt), 2) : "No "}ms] ${message.author.username}[${message.author.id}] ${message.channel.name}[${message.channel.id}] ${guild.name}[${guild.id}]`)
}