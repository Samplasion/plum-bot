const PremiumCommand = require('../../classes/PremiumCommand');
const PlumClient = require('../../classes/Client');
const PlumMessage = require('../../classes/Message');
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
            guildOnly: true
		});
	}

    /**
     * @param {PlumMessage} message 
     */
    // @ts-expect-error
	async run(message) {
        let queue = message.guild.queue;
        if (!queue.length)
            return message.error("There needs to be a queue so I can save it.");

        message.channel.send(require("util").inspect(queue), {
            code: true,
            split: true
        });
        
        return message.ok(`I have successfully resumed playing ${fetched.queue[0].songTitle}.`);
	}
};
