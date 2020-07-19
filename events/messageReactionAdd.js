module.exports = async (client, reaction, user) => {
    const message = reaction.message;
    if (message.partial) await message.fetch();
    if (!message.guild) return;

    if (reaction.count < 3) return;
    if (reaction.emoji.name !== '⭐') return;
    if (message.author.id === user.id) {
        if (message.guild.me.permissions.has('MANAGE_MESSAGES'))
            reaction.remove(user)

        if (message.guild.me.permissions.has('SEND_MESSAGES')) {
            // let errorMessage = await message.channel.send(`${user}, you may not star your own message.`);
            // await errorMessage.delete({timeout: 5000});
        }

        return;
    }

    const image = message.attachments.size > 0 ? isImage(message.attachments.first().url) : '';

    const reactionCount = await (await reaction.users.fetch()).filter(r => r.id !== message.author.id && !r.bot).size;
    if (reactionCount < 3) return;

    const starChannel = message.guild.config.get("starboardchan"); // message.guild.channels.find("name", "starboard");
    if (starChannel) {
        if (message.channel.id == starChannel.id) return;
        let postMessage = true;

        const fetchedMessages = starChannel.messages.fetch({ limit: 100 });

        const messageByRDanny = fetchedMessages.find(m => m.cleanContent.endsWith(message.id));
        if (messageByRDanny && message.guild.me.permissions.has('MANAGE_MESSAGES'))
            messageByRDanny.delete();

        const stars = fetchedMessages.find(m => m.embeds[0] && m.embeds[0].footer && m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(message.id));
        if (stars) {
            const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
            const foundStar = stars.embeds[0];
            const embed = this.client.utils.embed()
                .setColor(foundStar.color)
                .setAuthor(`${message.member.displayName} (#${message.channel.name})`, message.author.displayAvatarURL({format: 'png'}))
                .setThumbnail(message.guild.iconURL({format: 'png'}))
                .setTimestamp(foundStar.timestamp)
                .setFooter(`⭐ ${reactionCount} | ${message.id}`);

            if(!isEmpty(foundStar.description))	embed.setDescription(foundStar.description);
            if(!isEmpty(image))	embed.setImage(image);

            const starMsg = starChannel.messages.get(stars.id);
            starMsg.edit({ embed });
        } else {
            if (isEmpty(image) && isEmpty(message.content)) return message.channel.send(`${user}, you cannot star an empty message.`);
            const embed = this.client.util.embed()
                .setColor(message.member.displayHexColor)
                .setAuthor(`${message.member.displayName} (#${message.channel.name})`, message.author.displayAvatarURL({format: 'png'}))
                .setThumbnail(message.guild.iconURL({format: 'png'}))
                .setTimestamp(new Date())
                .setFooter(`⭐ ${reactionCount} | ${message.id}`);

            if(!isEmpty(message.content)) embed.setDescription(message.content);
            if(!isEmpty(image))	embed.setImage(image);

            starChannel.send({ embed });
        }
    }
};

function isImage(attachment) {
	const imageLink = attachment.split('.');
	const typeOfImage = imageLink[imageLink.length - 1];
	const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
	if (!image) return '';
	return attachment;
}

function isEmpty(value) {
	return (value == null || value.length === 0);
}
