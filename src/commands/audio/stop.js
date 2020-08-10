const PremiumCommand = require('../../classes/commands/PremiumCommand');
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
            name: "stop",
            memberName: "stop",
			group: 'audio',
            description: 'Stops the bot from playing music any more.',
            guildOnly: true
		});
	}

    /**
     * @param {PlumMessage} message 
     */
    // @ts-expect-error
	async run(message) {
        if(!message.member.voice.channel) return message.error("You can't stop me from playing music because you aren't in a voice channel");

		this.client.audio.active.delete(message.guild.id);
		if(message.guild.voice.connection) {
			message.guild.voice.connection.disconnect();
			return message.ok("I have stopped playing music");
		}
	}
};
