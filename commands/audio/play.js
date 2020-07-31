const PremiumCommand = require('../../classes/PremiumCommand');
const PlumClient = require('../../classes/Client');
const PlumMessage = require('../../classes/Message');
const YTDL = require('ytdl-core-discord');

const youtubeSearch = require('yt-search');
const YouTubePlayList = require("ytpl");

const { promisify } = require("util");
const PlumEmbed = require('../../classes/Embed');
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
            name: "play",
            memberName: "play",
			group: 'audio',
			description: 'Plays audio. Can either be a YouTube video or playlist.',
            formatExplanation: {
                "<link>": "A link of a YouTube video or playlist, or a video name."
            },
			args: [
                {
                    key: 'link',
                    prompt: "send the link to a video from Youtube you'd like to listen to.",
                    type: 'string',
                }
            ]
		});
	}

    /**
     * @param {PlumMessage} msg 
     * @param {object} args
     * @param {string} args.link 
     */
    // @ts-expect-error
	async run(msg, { link }) {
        // @ts-expect-error
		let canSend = msg.channel.sendable;

		// Step 1: Check if the user is in a Voice Channel
		let voiceChannel = await msg.member.voice.channel;
		if (!voiceChannel) return (canSend ? msg.error("You need to be in a voice channel in order for me to play music") : null);

		// Step 2: Check the user's perms for that specific voice channel
		let userperm = voiceChannel.permissionsFor(msg.member);
		if (!userperm.has('CONNECT')) return (canSend ? msg.error("You lost perms to connect to the Voice Channel.") : null);

		// Step 3: Check the bot perms for that specific voice channel
		let botperms = voiceChannel.permissionsFor(msg.client.user);
		if (!botperms.has('CONNECT')) return msg.error("I can't join. Make sure I have the proper permissions.").catch(console.error);
		if (!botperms.has('SPEAK')) return (canSend ? msg.error("I can't speak. Make sure I have the proper permissions.") : null);

		let embed = this.client.utils.embed()
			.setColor("#FF006E")
			// .setThumbnail(musicblock.url);

		// Step 4: Check if they try to search for a related video
		let fetched = this.client.audio.active.get(msg.guild.id);
		if (link == "related" && fetched) {
			embed.setTitle("Related Music Search", "http://clipart-library.com/images/ziXedkoBT.png", "https://youtube.com/");
			let relatedLink = await this.responceSelector(msg, fetched.queue[0].related.splice(0, 6), embed, 'related');

			if (relatedLink) this.play(msg, relatedLink.id.trim(), true)
        }

        // Step 5: Check if it's a playlist (playlists have their own unique features and code)
        if (link.startsWith("playlist:")) {
            if (Object.values(msg.guild.queues.data).filter(entry => entry.id == link.replace("playlist:", "")).length) {
                let queue = Object.values(msg.guild.queues.data).filter(entry => entry.id == link.replace("playlist:", ""))[0];
                for (let track of queue.queue) {
                    await this.play(msg, track.url, false);
                }
                return msg.ok(`Added ${queue.queue.length} items from playlist "${queue.name}" to queue | Requested by: ${msg.author.tag}`);
            }
        } else if (link.match(playlistRegex)) {
			var pl = await playlistRegex.exec(link)[6];
			const res = await ytpl(pl, { limit: 20 });

            for (var item of res.items) {
                await this.play(msg, item.url_simple, false)
            }

            return msg.ok(`Added ${res.total_items} song(s) to Queue: ${res.title} | Requested by: ${msg.author.tag}`);
		}

		// Step 6: Check if it's a valid link. If not, give us an error
		let URLvalid = false;

		let validate = await YTDL.validateURL(link);
		if (validate) validate = true;

		if (validate)
			return this.play(msg, link, true);

        let results = await findVideosAsync(link);

        embed.setAuthor("Music Search", "http://clipart-library.com/images/ziXedkoBT.png", "https://youtube.com/");
        let videoLink = await this.responceSelector(msg, results.videos.splice(0, 6), embed);

        if (videoLink) this.play(msg, videoLink.videoId.trim(), true);

	}

    /**
     * 
     * @param {PlumMessage} message 
     * @param {*} video 
     * @param {*} reply 
     */
	async play(message, video, reply) {
		var info = await YTDL.getInfo(video);

        /** @type {import('../../utils/audio').GuildAudioManager} */
        // @ts-expect-error
		let data = this.client.audio.active.get(message.guild.id) || {};

		if (!data.connection) {
			if (!message.guild.voice || (message.guild.voice && !message.guild.voice.connection)) data.connection = await message.member.voice.channel.join();
			else data.connection = message.guild.voice.connection;
		}

		if (!data.queue) data.queue = [];
		data.guildID = message.guild.id;

		data.queue.push({
			songTitle: info.title,
			requester: message.author.tag,
			url: info.video_url,
			announceChannel: message.channel.id,
			length: this.getTime(info.length_seconds),
			secs: info.length_seconds,
			description: info.description,
			thumbnail: info.thumbnail_url,
			timerequest: new Date(),
			related: info.related_videos
		});

		if (!data.dispatcher) this.client.audio.play(message, this.client, data);
		else if (reply) message.ok(`Added to Queue: ${info.title} | Requested by: ${message.author.tag}`);

		this.client.audio.active.set(message.guild.id, data);
	}

    /**
     * 
     * @param {Object.<string, any>} videos 
     * @param {string} index 
     * @param {PlumEmbed?} [embed] 
     */
	async handleSelector(videos, index, embed = null) {
		let video = videos[index];

		if (!this.isGood(video.author.channelUrl)) {
			try {
				let videoInfo = await YTDL.getInfo(`https://www.youtube.com${videos[index].url}`)
				video.author.channelUrl = videoInfo.author.channel_url
			} catch {}
		}

		if (embed) {
			embed.addField(
				`**${parseInt(index)+1}.** ${video.title} [${video.timestamp}]`,
				`[Link](https://youtube.com${video.url}) | by ${(this.isGood(video.author.channelUrl) ? `[${video.author.name}](${video.author.channelUrl})` : video.author.name)}`
			);
		} else {
			return `**${parseInt(index)+1}.** [${videos[index].title}](https://youtube.com${videos[index].url}) bu ${(this.isGood(video.author.channelUrl) ? `[${video.author.name}](${video.author.channelUrl})` : video.author.name)} \`[${videos[index].timestamp}]\`\n`;
		}

		return embed
	}

	getTime(secs) {
		if (typeof secs != "number") secs = parseInt(secs);
		var mins = secs / 60;
		var oms = mins > Math.floor(mins) && mins < Math.ceil(mins) // one more second
			// if `mins` is greater than the nearest lower int, but lower than the nearest greater int, add a second
		var sec = oms ? (secs % 60) + 1 : secs % 60;
		return `${this.client.utils.pad(Math.floor(mins))}:${this.client.utils.pad(Math.floor(sec))}`
	}
};
