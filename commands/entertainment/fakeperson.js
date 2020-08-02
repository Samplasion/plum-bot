const Command = require('../../classes/Command');
const phin = require('phin');
const { MessageAttachment } = require('discord.js');

module.exports = class AiPersonCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'fakeperson',
			aliases: ['this-person-does-not-exist', 'person'],
			group: 'entertainment',
			memberName: 'fakeperson',
			description: 'Returns a randomly generated person.',
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	async run(msg) {        
        let embed = msg.makeEmbed()
            .setDescription("[Can't see the image? Click here](https://thispersondoesnotexist.com/image)")
            .setImage("https://thispersondoesnotexist.com/image");
		return msg.channel.send(embed);
	}
};