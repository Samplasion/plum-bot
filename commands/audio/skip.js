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
            name: "skip",
            memberName: "skip",
			group: 'audio',
            description: 'Skips the current track and switches to the next one in queue, if any.',
            guildOnly: true
		});
	}

    /**
     * @param {PlumMessage} message 
     */
    // @ts-expect-error
	async run(message, { modskip }) {

		let voiceChannel = message.member.voice.channel;
		if (!voiceChannel)
			return message.error("I think it may work better if you are in a voice channel!");

		let fetched = this.client.audio.active.get(message.guild.id);
		if(!fetched)
			return message.error("there isn't any music playing in the server");

		if (!message.member.hasPermission('MUTE_MEMBERS'))
			modskip = false;

		let uservcCount = message.member.voice.channel.members.size;
		let requiredToSkip = Math.ceil(uservcCount / 2);

		let currentSong = fetched.queue[0];
		if (!currentSong.voteSkips)
			currentSong.voteSkips = [];

		let isSkipped = this.handleSkip(fetched, requiredToSkip, message, modskip)
		if (isSkipped) return;

		if (currentSong.voteSkips.includes(message.member.id))
			return message.error(`You already voted to skip! ${currentSong.voteSkips.length}/${requiredToSkip} required.`);

		currentSong.voteSkips.push(message.member.id);
		this.client.audio.active.set(message.guild.id, fetched);

		isSkipped = this.handleSkip(fetched, requiredToSkip, message, modskip)
		if (!isSkipped)
			return message.ok(`Your vote has been added. ${currentSong.voteSkips.length}/${requiredToSkip} required`);
	}

    /**
     * 
     * @param {*} fetched 
     * @param {number} requiredToSkip 
     * @param {PlumMessage} message 
     * @param {boolean} modskip 
     */
	handleSkip(fetched, requiredToSkip, message, modskip) {

		let canSkip = fetched.queue[0].voteSkips.length >= requiredToSkip || message.author.tag == fetched.queue[0].requester || modskip;
		if (!canSkip)
			return false;

		if (!fetched.queue[1])
			message.info('The song has been successfully skipped, but there is no music left.');

		fetched.dispatcher.emit('finish');
		return true;
	}
};
