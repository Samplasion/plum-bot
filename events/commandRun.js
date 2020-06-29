function roundNumber(num, scale) {
  if(!("" + num).includes("e")) {
    return +(Math.round(num + "e+" + scale) + "e-" + scale);
  } else {
    var arr = ("" + num).split("e");
    var sig = ""
    if(+arr[1] + scale > 0) {
      sig = "+";
    }
    return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
  }
}

module.exports = async (client, command, promise/* <Message> */, message/* <prefix><command> <args> */, args, isCommandPattern) => {
  var cmdArgs = []
  if (args instanceof Array) cmdArgs = args
  else if (args instanceof String) cmdArgs = [args]
  else cmdArgs = Object.values(args)
  var botMsg = await promise || null
  var guild = message.guild
  if (!message.guild) guild = { name: "Direct Messages", id: client.user.id }
  var channel = await client.channels.fetch("727104956263432213");
  if (channel && channel.send) {
    let embed = client.utils.log(
      "Command run",
      message.cleanContent, 
      [
        ["Author", `${message.author.tag} [${message.author.id}]`],
        [":globe_with_meridians: Server", `${message.guild.name} [${message.guild.id}]`],
        [":file_folder: Channel", `#${message.channel.name} [${message.channel.id}] (<#${message.channel.id}>)`],
        [":1234: Message ID", `${message.id}`, true]
      ]
    );
    
    channel.send(embed);
  } else
    console.log(`  [CMD] ${message.command.name}(${cmdArgs.join(", ")}) [${botMsg ? roundNumber((botMsg.createdAt - message.createdAt), 2) : "No "}ms] ${message.author.username}[${message.author.id}] ${message.channel.name}[${message.channel.id}] ${guild.name}[${guild.id}]`)
}