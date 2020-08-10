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
            name: "resume",
            memberName: "resume",
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

        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
            return message.error("In order to use audio commands, you will need to be in a voice channel.");

        let fetched = this.client.audio.active.get(message.guild.id);
        if (!fetched)
            return message.error("In order to resume playing audio, there needs to be audio playing in the channel.");

        if (!fetched.dispatcher.paused)
            return message.error("The audio that you are currently supposed to be resuming is already playing.");

        fetched.dispatcher.resume();
        return message.ok(`I have successfully resumed playing ${fetched.queue[0].songTitle}.`);
	}
};
