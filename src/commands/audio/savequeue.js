const PremiumCommand = require('../../classes/commands/PremiumCommand');
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
            description: 'Saves the current queue into a playlist.',
            guildOnly: true,
            formatExplanation: {
                "<name>": "The name to save the playlist under."
            },

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

        if (Object.values(message.guild.queues.data).map(entry => entry.name).includes(name))
            return message.error("There's already a plylist with that name!");

        let id = "";
        let tries = 0;
        let increment = 0;
        do {
            if (tries == 10) {
                tries = 0;
                increment++;
            }
            id = this.generate(6 + increment);
            tries++;
        } while (Object.keys(message.guild.queues.data).includes(id));

        message.guild.queues.add({
            name,
            id,
            queue
        });
        
        return message.ok(`I have successfully saved the current queue as "${name}" (playlist ID: \`${id}\`).`);
    }
    
    generate(length = 6) {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
        for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  
        return text;
    }
};
