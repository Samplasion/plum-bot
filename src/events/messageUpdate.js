/**
 * 
 * @param {import("../classes/Client")} client 
 * @param {import("../classes/Message")} oldMessage 
 * @param {import("../classes/Message")} newMessage 
 */
module.exports = async (client, oldMessage, newMessage) => {
    await logEdit(client, oldMessage, newMessage);
    await newMessage.checkSwears();
}

async function logEdit(client, oldMessage, newMessage) {
	if (oldMessage.content == newMessage.content) return;
	if (oldMessage.content.length < 1) return;
	if (oldMessage.content.length > 1000) return;
	if (oldMessage.author.bot) return;
	if (!oldMessage.guild) return;
  
  let e = client.utils.emojis;
	let embed = client.utils.embed()
		.setFullFooter(`Sent by ${newMessage.author.tag} [${newMessage.author.id}]`)
		.setTitle(`${newMessage.author.username} updated their message`)
		.addInline(e.prev + " Before", `${oldMessage.cleanContent}`)
		.addInline(e.next + " After", `${newMessage.cleanContent}`)
		.addField(e.channel + " Channel", `**#${newMessage.channel.name}** (<#${newMessage.channel.id}>) [${newMessage.channel.id}]`)
		.addField(e.id + " Message ID", `${newMessage.id}`)
		.setTimestamp(new Date())
		.setThumbnail(newMessage.author.displayAvatarURL());

    newMessage.guild.log(embed);
}