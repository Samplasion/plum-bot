function random(a, b = 0) {
    var max = Math.max(a, b),
        min = Math.min(a, b)
    return ~~(Math.random() * (max - min) + min)
}

function isEmpty(variable) { //Function to check if value is really empty or not
	return (variable && variable !== null && (variable.size || variable.length))
}

module.exports = async (client, member) => {
    // GOODBYE
    let guild = member.guild;
    if (!guild.config.data.welcomechan || 
        !guild.config.data.leavemessage || 
        !guild.config.data.leavemessage.length)
        return;
    let channel = await client.channels.fetch(guild.config.data.welcomechan);
    if (channel && channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        let messages = guild.config.data.leavemessage;
        let message = messages[random(messages.length)];
        channel.send(message
            .split("{{server}}").join(guild.name)
            .split("{{user}}").join(member.displayName)
            .split("{{mention}}").join(`<@${member.user.id}>`));
    }

    // LOG
    if (member.guild.partial) await member.guild.fetch();

    let memberRemoveLogEmbed = client.utils.embed()
        .setTitle(client.utils.emojis.prev + " User Left")
        .setThumbnail(member.user.displayAvatarURL({format: 'png'}))
        .setDescription(`This server now has ${member.guild.memberCount} members`)
        .setFooter(`${member.user.tag} [${member.id}]`, member.user.displayAvatarURL({format: 'png'}));

    if (member.joinedAt)
        memberRemoveLogEmbed.addField("Joined", member.joinedAt);

    if (member.roles) {
        let roles = member.roles.cache.filter(role => role.id != member.guild.id).map(r => `<@${r.id}>`).join(", ");
        if(!isEmpty(roles))
            memberRemoveLogEmbed.addField("Roles", roles);
    }

    guild.log(memberRemoveLogEmbed);
}