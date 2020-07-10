const PremiumCommand = require('../../classes/PremiumCommand');
const PlumClient = require('../../classes/Client');
const PlumMessage = require('../../classes/Message');

module.exports = class QueueAudioCommand extends PremiumCommand {
    /**
     * 
     * @param {PlumClient} client 
     */
	constructor(client) {
		super(client, {
            name: "queue",
            memberName: "queue",
			group: 'audio',
            description: 'Shows the song play queue.',
            guildOnly: true,

            args: [
                {
                    key: "action",
                    prompt: "",
                    default: "",
                    type: "string",
                    parse: (val) => val.toLowerCase()          
                },
                {
                    key: "args",
                    prompt: "",
                    default: "",
                    type: "string"
                }
            ]
		});
	}

    /**
     * @param {PlumMessage} msg
     * @param {Object} args
     * @param {string} args.action
     * @param {string} args.args
     */
    // @ts-expect-error
	async run(msg, { action, args }) {
        if (!action && !args) action = "current";
        if (action && !["current", "list"].includes(action)) {
            return this.view(msg, action.trim());
        }
        // @ts-ignore
        return this[action.toLowerCase()](msg, args);
    }

    /**
     * @param {PlumMessage} msg 
     */
    async list(msg) {
        if (!Object.keys(msg.guild.queues.data).length) 
            return msg.error("There are no playlists!");
        
        let s = "";
        for (let playlist of Object.values(msg.guild.queues.data)) {
            s += ` - **${playlist.name}** [\`${playlist.id}\`] (${this.client.utils.plural(playlist.queue.length, "song")})\n`
        }

        msg.channel.send(s);
    }

    /**
     * @param {PlumMessage} msg 
     * @param {string} id 
     */
    async view(msg, id) {
        if (!id)
            return msg.error("You have to enter a playlist ID to see what songs are in that playlist.");

        msg.info(`${id}, ${require("util").inspect(Object.keys(msg.guild.queues.data))}`);

        if (!Object.keys(msg.guild.queues.data).includes(id))
            return msg.error("There's no playlist/queue with that ID.");

        let playlist = msg.guild.queues.data[id];
        let plString = playlist.queue.map((audio, index) => `${index + 1}. ${audio.songTitle} [${audio.length}] | <${audio.url}>`).join("\n");

        msg.channel.send(`**${playlist.name}** [\`${playlist.id}\`]\n\n${plString}`, { split: true });
    }

    /**
     * @param {PlumMessage} msg 
     */
    async current(msg) {
		let fetched = this.client.audio.active.get(msg.guild.id);
		if (!fetched)
			return msg.error("There currently isn't any music playing in this server");

		if (fetched.queue.length < 1)
			return msg.error("There currently isn't any music playing in this server");

		let nowPlaying = fetched.queue[0];
		let next = fetched.queue[1];

		if (msg.guild.me.hasPermission('EMBED_LINKS')) {
			let embed = this.client.utils.embed()
				.setTimestamp(new Date())
				.setDescription(`**NOW PLAYING**: [${nowPlaying.songTitle}](${nowPlaying.url}) | Requested by ${nowPlaying.requester}`)
				.setThumbnail(msg.guild.iconURL({ format: 'png' }))
                .setFullFooter('Add your own song to this list using the play command');
                
            if (next)
                embed.setDescription(embed.description + `\n**NEXT**: [${next.songTitle}](${next.url}) | Requested by ${next.requester}`);

            let i = 1;
			for (var song of fetched.queue) {
				if (song == nowPlaying || song == next) continue;
                if (i > 25) // Discord puts a hard limit on how many fields you can have in an embed
                    break;
                    
                embed.addField(`${song.songTitle}`, `[Link](${song.url}) | Requested by ${song.requester}`);
                i++;
			}

			return msg.channel.send(`${this.client.utils.emojis.music} Queue`, { embed });
		}

		let musiclist = `${this.client.utils.emojis.music} Queue\n`;

		for (var song of fetched.queue) {
			if (song == nowPlaying) {
				musiclist += `**NOW PLAYING**: ${song.songTitle} | Requested by ${song.requester} \n`;
				continue;
			}

			if (song == next) {
				musiclist += `**NEXT**: ${song.songTitle} | Requested by ${song.requester} \n\n`;
				continue;
			}

			musiclist += `${song.songTitle} | Requested by ${song.requester} \n`;
		}

		return msg.chanel.send(musiclist);
	}
};
