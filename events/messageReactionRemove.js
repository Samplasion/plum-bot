module.exports = async (client, reaction, user) => {
    const message = reaction.message;
    if (message.partial) await message.fetch();
    if (!message.guild) return;

    const starChannel = await message.guild.config.get("starboardchan");

    if (reaction.emoji.name !== '⭐') return;
    if (message.author.id === user.id) return;
    if (starChannel && message.channel.id == starChannel.id) return;

    const reacount = await (await reaction.users.fetch()).filter(r => r.id !== message.author.id && !r.bot).size;

    if (starChannel) {
        const image = message.attachments.size > 0 ? extension(message.attachments.first().url) : '';

        const fetchedMessages = starChannel.messages.fetch({ limit: 100 });
        const stars = fetchedMessages.find(m => m.embeds[0] && m.embeds[0].footer && m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(message.id));
        if (stars) {
            const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
            const foundStar = stars.embeds[0];
            const embed = this.client.utils.embed()
                .setColor(foundStar.color)
                .setAuthor(`${message.author.username} (#${message.channel.name})`, message.author.displayAvatarURL({format: 'png'}))
                .setThumbnail(message.guild.iconURL({format: 'png'}))
                .setTimestamp(foundStar.timestamp)
                .setFooter(`⭐ ${reacount} | ${message.id}`);

            if(!isEmpty(foundStar.description))	embed.setDescription(foundStar.description);
            if(!isEmpty(image))	embed.setImage(image);

            const starMsg = starChannel.fetchMessage(stars.id);
            if(reacount < 4)	starMsg.delete(1000);
            else 				starMsg.edit({ embed });
        } else {
            if(reacount < 4) return;

            if (isEmpty(image) && isEmpty(message.content)) return;
            const embed = this.client.util.embed()
                .setColor(message.member.displayHexColor)
                .setAuthor(`${message.author.username} (#${message.channel.name})`, message.author.displayAvatarURL({format: 'png'}))
                .setThumbnail(message.guild.iconURL({format: 'png'}))
                .setTimestamp(new Date())
                .setFooter(`⭐ ${reacount} | ${message.id}`);

            if(!isEmpty(message.cleanContent)) embed.setDescription(message.content);
            if(!isEmpty(image))	embed.setImage(image);

            starChannel.send({ embed });
        }
    }

    let pointsUser = this.client.db.points.findOne({guild: message.guild.id, member: message.author.id}) || this.client.db.points.insert({guild: message.guild.id, member: message.author.id, points: 0, level: 0});

    if(reacount == 3) {
        //If the reaction count is 3, the user gets 20 points
        pointsUser.points = 20 + user.points;
    } else if (reacount > 3) {
        pointsUser.points = 5 + user.points;
    }

    if((reacount+1) > 3) {
        // If the reaction count was above 3, the user gets -5 points
        pointsUser.points = user.points - 5;
    } else if ((reacount+1) == 3) {
        // If it was 3, they will get -20 points
        pointsUser.points = user.points - 20;
    }

    this.client.db.points.update(pointsUser);
}

function extension(attachment) {
	const imageLink = attachment.split('.');
	const typeOfImage = imageLink[imageLink.length - 1];
	const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
	if (!image) return '';
	return attachment;
}

function isEmpty(value) {
	return (value == null || value.length === 0);
}
