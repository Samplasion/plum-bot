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
    if (channel && channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        let messages = guild.config.data.welcomemessage;
        let message = messages[random(messages.length)];
        channel.send(client.utils.render({ guild, member }, message));
    }

    // LOG
    let name = member.user.username;
    let owner = await member.guild.members.fetch(member.guild.ownerID);

    let logembed = client.utils.embed()
        .setTitle(client.utils.emojis.next + " User Joined")
        .setThumbnail(member.user.displayAvatarURL({format: 'png'}))
        .setDescription(`This server now has ${member.guild.memberCount} members`)
        .addField('Account Age', member.user.createdAt)
        .setFooter(`${member.user.tag} [${member.user.id}]`, member.user.displayAvatarURL({format: 'png'}));

    let inviteregex = /(http(s)?:\/\/)?(discord(\.gg|app.com\/invite|.io))\/([a-zA-Z0-9]{1,15})?/gmi;
    // eslint-disable-next-line no-useless-escape
    let plsadd = /(pls\s+add|add\s+me)\s+([\.\:\/\w]{0,32})?\s+(\(tag\))\s+([\w#]{0,32})?/gmi;

    if (name.match(inviteregex) || name.match(plsadd)) {
        if (member.guild.me.hasPermission('BAN_MEMBERS')) {
            if (name.match(inviteregex))	member.ban({ reason: "Invite link in username" });
            if (name.match(plsadd))			member.ban({ reason: "Asking for friends in username" });
        } else {
            logembed.addField(':warning: Potential Malicious Account', 'I do not have the permissions nessesary to ban him')
        }
    }

    guild.log(logembed);
}