function random(a, b = 0) {
    var max = Math.max(a, b),
        min = Math.min(a, b)
    return ~~(Math.random() * (max - min) + min)
}

module.exports = async (client, member) => {
    let guild = member.guild;
    if (!guild.config.data.welcomechan || 
        !guild.config.data.leavemessage || 
        !guild.config.data.leavemessage.length)
        return;
    let channel = await client.channels.fetch(guild.config.data.welcomechan);
    if (!channel || !channel.sendable)
        return;
    let messages = guild.config.data.leavemessage;
    let message = messages[random(messages.length)];
    channel.send(message
        .split("{{server}}").join(guild.name)
        .split("{{user}}").join(member.displayName)
        .split("{{mention}}").join(`<@${member.user.id}>`));
}