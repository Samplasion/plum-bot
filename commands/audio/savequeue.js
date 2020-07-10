const PremiumCommand = require('../../classes/PremiumCommand');
const PlumClient = require('../../classes/Client');
const PlumMessage = require('../../classes/Message');
const PlumGuild = require('../../classes/Guild');
const YTDL = require('ytdl-core-discord');

const youtubeSearch = require('yt-search');
const YouTubePlayList = require("ytpl");

const { promisify } = require("util");
const { StreamDispatcher } = require('discord.js');
const findVideosAsync = promisify(youtubeSearch);
const ytpl = promisify(YouTubePlayList);

const playlistRegex = /(http(s)?:\/\/((www\.)?(youtube\.com|youtu.be))\/playlist\?list\=)?([^=\s*][a-zA-Z0-9\-\_]{33,34})/g

module.exports = class PlayAudioCommand extends PremiumCommand {
    /**
     * 
     * @param {PlumClient} client 
     */
	constructor(client) {
		super(client, {
            name: "savequeue",
            aliases: ["sq"],
            memberName: "savequeue",
			group: 'audio',
            description: 'Resumes a paused track.',
            guildOnly: true,

            args: [{
                key: "name",
                prompt: "what's gonna be the name of the playlist?",
                type: "string"
            }]
		});
	}

    /**
     * @param {PlumMessage} message 
     * @param {string} name
     */
    // @ts-expect-error
	async run(message, { name }) {
        let queue = message.guild.queue;
        if (!queue.length)
            return message.error("There needs to be a queue so I can save it.");

        if (message.guild.queues.data.map(entry => entry.name).includes(name))
            return message.error("There's already a plylist with that name!");

        let id = "";
        do {
            id = this.generate();
        } while (message.guild.queues.data.map(entry => entry.id).includes(id));

        message.guild.queues.add({
            name,
            id,
            queue
        });

        message.channel.send(require("util").inspect(queue, { depth: Infinity }), {
            code: true,
            split: true
        });
        
        return message.ok(`I have successfully saved the current queue as "${name}" (playlist ID: \`${id}\`).`);
    }
    
    generate(length = 6) {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?@#$%^&()-_=+/|{}"*';
  
        for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  
        return text;
    }
};
