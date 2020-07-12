function random(a, b = 0) {
    var max = Math.max(a, b),
        min = Math.min(a, b)
    return ~~(Math.random() * (max - min) + min)
}

module.exports = async (client, member) => {
    // HELLO
    let guild = member.guild;
    if (!guild.config.data.welcomechan || 
        !guild.config.data.welcomemessage || 
        !guild.config.data.welcomemessage.length)
        return;
    let channel = await client.channels.fetch(guild.config.data.welcomechan);
    if (!channel || !channel.sendable)
        return;
    let messages = guild.config.data.welcomemessage;
    let message = messages[random(messages.length)];
    channel.send(message
        .split("{{server}}").join(guild.name)
        .split("{{user}}").join(member.displayName)
        .split("{{mention}}").join(`<@${member.user.id}>`));

    // LOG
    let name = member.user.username;
    let owner = member.guild.members.get(member.guild.ownerID);

    let logembed = this.client.utils.embed()
        .setDescription(`This server now has ${member.guild.memberCount} members`)
        .setThumbnail(member.guild.iconURL({format: 'png'}))
        .addField('Account Age', member.user.createdAt)
        .setFooter(`${member.user.tag} (#${member.user.id})`, member.user.displayAvatarURL({format: 'png'}));

    let inviteregex = /(http(s)?:\/\/)?(discord(\.gg|app.com\/invite|.io))\/([a-zA-Z0-9]{1,15})?/gmi;
    // eslint-disable-next-line no-useless-escape
    let plsadd = /(pls\s+add|add\s+me)\s+([\.\:\/\w]{0,32})?\s+(\(tag\))\s+([\w#]{0,32})?/gmi;

    if (name.match(inviteregex) || name.match(plsadd)) {
        if (member.guild.me.hasPermission('BAN_MEMBERS')) {
            if (name.match(inviteregex))	this.client.ban(member, "Invite link in username", owner);
            if (name.match(plsadd))			this.client.ban(member, "Asking for friends in username", owner);
        } else {
            logembed.addField(':warning: Potential Malicious Account', 'I do not have the permissions nessesary to ban him')
        }
    }

    guild.log(logembed);
}