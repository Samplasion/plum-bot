module.exports = (client, command, promise/* <Message> */, message/* <prefix><command> <args> */, args, isCommandPattern) => {
  client.permissionLevels.forEach(permission => {
    if (permission.validate(message) == true) message.member.permissionLevel = permission.level
  })
}