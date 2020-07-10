const Youtube = require("ytdl-core-discord");
const PlumMessage = require("../classes/Message");
const { StreamDispatcher, VoiceConnection } = require("discord.js");
const PlumClient = require("../classes/Client");

/**
 * @typedef RelatedTrack
 * 
 * @property {string | undefined} [id]
 * @property {string | undefined} [title]
 * @property {string | undefined} [author]
 * @property {string | undefined} [length_seconds]
 * @property {string | undefined} [iurlmq]
 * @property {string | undefined} [short_view_count_text]
 * @property {string} session_data
 * @property {string | undefined} [endscreen_autoplay_session_data]
 * @property {string | undefined} [iurlhq]
 * @property {string | undefined} [playlist_iurlhq]
 * @property {string | undefined} [playlist_title]
 * @property {string | undefined} [playlist_length]
 * @property {string | undefined} [playlist_iurlmq]
 * @property {string | undefined} [video_id]
 * @property {string | undefined} [list]
 * @property {string | undefined} [thumbnail_ids]
 */

/*
type relatedVideo = {
      id?: string;
      title?: string;
      author?: string;
      length_seconds?: string;
      iurlmq?: string;
      short_view_count_text?: string;
      session_data: string;
      endscreen_autoplay_session_data?: string;
      iurlhq?: string;
      playlist_iurlhq?: string;
      playlist_title?: string;
      playlist_length?: string;
      playlist_iurlmq?: string;
      video_id?: string;
      list?: string;
      thumbnail_ids?: string;
    }
    */

/** 
 * @typedef GuildAudioManager Manages the Voice connection between
 * the bot and a particular guild.
 * 
 * @property {StreamDispatcher} dispatcher Manages the state of the track being played.
 * @property {VoiceConnection} connection Manages the sending of the track's data to the channel.
 * @property {AudioTrack[]} queue Stores the metadata of the songs in queue.
 * @property {string} guildID The ID of the Guild that created this.
 */

/**
 * @typedef AudioTrack Stores the metadata of a particular track.
 * 
 * @property {string} songTitle The title of the track.
 * @property {string} requester The user who requested the track.
 * @property {string} url The URL of the raw song.
 * @property {string} announceChannel The channel where the `play` command
 * was originally called.
 * @property {string} length The length of the track in "MM:SS" format.
 * @property {string} secs The length of the track, in seconds.
 * @property {string} description The full description of the track.
 * @property {string} thumbnail The thumbnail of the track.
 * @property {Date} timerequest The date when the `play` command
 * was originally called. 
 * @property {RelatedTrack[]} related A list of up to 10 related videos (if any).
 */

/**
 * @param {any} variable 
 */
const isGood = (variable) => {
	if (variable && variable !== null && (variable.size || variable.length)) return true;
		return false;
}

/** @type {Map<string, GuildAudioManager>} */
const active = new Map();

/**
 * Plays a song in one's voice channel.
 * @param {PlumMessage} msg The message that called the play command
 * @param {PlumClient} client 
 * @param {*} data 
 */
async function play(msg, client, data) {
    /** @type {PlumMessage?} */
	let playing;
	if (!data.connection) {
		if (!msg.member || (msg.member && !msg.member.voice))
			return client.audio.finish(msg, client, data.dispatcher);

        // @ts-expect-error
        if (!msg.guild.voice || (msg.guild.voice && !msg.guild.voice.connection))
            // @ts-expect-error
			data.connection = await msg.member.voice.channel.join();
        else
            // @ts-expect-error
			data.connection = msg.guild.voice.connection;
	}
	data.dispatcher = data.connection.play(await Youtube(data.queue[0].url), { type: 'opus', volume: false })
		.on('start', async () => {
			let embed = client.utils.embed()
				.setTitle(`${client.utils.emojis.music} Now Playing: ${data.queue[0].songTitle}`, data.queue[0].url)
				.setColor("#FF006E")
				.addInline("Requester", data.queue[0].requester)
				.addInline("Duration", data.queue[0].length)
				.setTimestamp(data.queue[0].timerequest)
				.setThumbnail(data.queue[0].thumbnail);

			if (isGood(data.queue[0].related) && isGood(data.queue[0].related[0])) {
				let related = data.queue[0].related[0];
				embed.addField("Related", `**[${related.title}](https://www.youtube.com/watch?v=${related.id})** ` + `by [${related.author}](https://youtube.com/channel/${related.ucid})`);
			}

			try {
                let lastChannelMessage = await msg.channel.lastMessage;
                // @ts-expect-error
				if (lastChannelMessage.author.id == client.user.id) {
                    // @ts-expect-error
					playing = await lastChannelMessage.edit({ embed: embed });
				}
				else {
                    // @ts-expect-error
					playing = await msg.channel.send({ embed: embed });
				}
			}
			catch (e) {
                // @ts-expect-error
				playing = await msg.channel.send({ embed: embed });
			}
		})
		.on('debug', (/** @type {*} */packet) => console.log(`[DISPATCHER DEBUG] ${packet}`))
		.on('error', async (/** @type {Error} */ err) => {
			console.error('Error occurred in stream dispatcher:', err);
			if (playing)
				playing.edit(`An error occurred while playing the song: ${err.toString()}`);
			else // @ts-expect-error
				playing = await msg.channel.send(`An error occurred while playing the song: ${err.toString()}`);
			data.dispatcher.guildID = data.guildID;
			client.audio.finish(msg, client, data.dispatcher);
		})
		.on('finish', () => {
			data.dispatcher.guildID = data.guildID;
			client.audio.finish(msg, client, data.dispatcher);
		});
}

/**
 * 
 * @param {PlumMessage} msg 
 * @param {*} client 
 * @param {*} dispatcher 
 */
async function finish(msg, client, dispatcher) {
	let fetched = await client.audio.active.get(dispatcher.guildID);
	let voicechat = client.guilds.cache.get(dispatcher.guildID).me.voice.channel;
	try {
		const vcsize = await voicechat.members.filter(val => val.id !== client.user.id).size;
		if (!vcsize) {
			client.audio.active.delete(dispatcher.guildID);
			if (voicechat)
				return voicechat.leave();
			dispatcher.destroy();
		}
		await fetched.queue.shift();
		if (fetched.queue.length > 0) {
			await client.audio.active.set(dispatcher.guildID, fetched);
			client.audio.play(msg, client, fetched);
		}
		else {
			client.audio.active.delete(dispatcher.guildID);
			if (voicechat)
				return voicechat.leave();
			dispatcher.destroy();
		}
	}
	catch (error) {
		console.error(error);
		if (voicechat)
			return voicechat.leave();
		dispatcher.destroy();
	}
}

module.exports = {
    active,
    play,
    finish
}
