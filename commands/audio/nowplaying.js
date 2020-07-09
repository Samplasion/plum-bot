const PremiumCommand = require('../../classes/PremiumCommand');
const PlumClient = require('../../classes/Client');
const PlumMessage = require('../../classes/Message');
const YTDL = require('ytdl-core-discord');

const youtubeSearch = require('yt-search');
const YouTubePlayList = require("ytpl");

const { promisify } = require("util");
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
            name: "nowplaying",
            memberName: "nowplaying",
			group: 'audio',
            description: 'Plays audio. Can either be a Youtube video or one of the streams from listen.moe',
            guildOnly: true
		});
	}

    /**
     * @param {PlumMessage} message 
     */
    // @ts-expect-error
	async run(message) {

		let fetched = this.client.audio.active.get(message.guild.id);
		if (!fetched)
			return message.error("There currently isn't any music playing in this server.");

		let nowPlaying = fetched.queue[0];

		let messagereply = `__**<:music:494355292948004874> Now playing: ${nowPlaying.songTitle}**__: <${nowPlaying.url}>`

		let embed;
		if (message.channel.embedable) {
			embed = this.client.utils.embed()
				.setColor("#FF006E")
				.setTimestamp(nowPlaying.timerequest)
				.setThumbnail(nowPlaying.thumbnail)
				.setFooter("Requested by " + nowPlaying.requester)
				.addField("Progress", `${this.progressBar(Math.round(fetched.dispatcher.streamTime/1000), nowPlaying.secs, nowPlaying.url, 15)} (${this.getTime(fetched.dispatcher.time/1000)}/${nowPlaying.length})`, true)

			if(nowPlaying.description && nowPlaying.description.length < 1000)
				embed.setDescription(nowPlaying.description);

			const YT = "https://youtube.com/";
			let relatedvidlist = "";

      		for (var relatedvideo of nowPlaying.related) {
        		if (!relatedvideo.id) continue;
        		if (relatedvidlist.length > 768) break;

				relatedvidlist += `**[${relatedvideo.title}](${YT}watch?v=${relatedvideo.id})** by [${relatedvideo.author}](${YT}channel/${relatedvideo.ucid})\n`;
			}

			relatedvidlist += `\nType \`${message.prefix}play related\` to play a related video`;
			embed.addField("Related Videos", relatedvidlist);
    	} else {
      		let messagenoembed = `\n ${nowPlaying.description} \n\n Requested by ${nowPlaying.requester}`;
      		if ((messagereply + messagenoembed).length <= 2000) messagereply = messagereply + messagenoembed
    	}

		message.channel.send(messagereply, embed ? {embed} : {});
	}

	getTime(secs) {
		var mins = secs / 60;
		var oms = mins > Math.floor(mins) && mins < Math.ceil(mins) // one more second
																	// if `mins` is greater than the nearest
																	// lower int, but lower than the nearest
																	// greater int, add a second
		var sec = (secs % 60) + (oms ? 0 : 1);
		return `${this.client.util.pad(Math.floor(mins))}:${this.client.util.pad(Math.floor(sec))}`
	}

	progressBar(now, total, url, bars) {
		var bars = 7;
		var ab = Math.round((now * bars) / total)
		var a = "[[";
		var i = 0, j = 0;
		while (i <= bars) {
			a += ab > i ? "▬" : "";
			i++;
		}
		a += `](${url})`;
		while (j <= bars) {
			a += ab >= j ? "" : "▬";
			j++;
		}
		return a + "]";
	}
};
