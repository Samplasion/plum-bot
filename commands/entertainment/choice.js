const Command = require('../../classes/Command');

module.exports = class ChooseCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'choose',
			aliases: ['pick'],
			group: 'entertainment',
			memberName: 'choice',
			description: 'Chooses between options you provide.',
			args: [
				{
					key: 'choices',
					type: 'string',
					infinite: true,
					max: 2000,
					prompt: '',
				}
			]
		});
	}

	run(msg, { choices }) {
        let embed = msg.makeEmbed()
            .setTitle("My choice")
            .setDescription(`I choose ${choices[Math.floor(Math.random() * choices.length)]}!`)
		return msg.channel.send(embed);
    }
}