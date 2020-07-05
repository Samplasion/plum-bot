const   Command   = require('./../../classes/Command.js');
const { oneLine } = require('common-tags');

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      group: 'moderation',
      memberName: 'ban',
      description: 'Bans an user.',
      details: oneLine`You can also ban someone who isn't in your server.
To do so, just use the ID instead of the tag, name or ping.
Doing so will prevent spammers from joining.
This permanently bans users.`,
      examples: ['ban discord.gg/spamServer obviously spamming'],
      permLevel: 2,
      guildOnly: true,
			clientPermissions: ["BAN_MEMBERS"],
			args: [
				{
					key: "user",
					type: "user",
					prompt: "Please provide a user to ban."
				},
				{
					key: "reason",
					prompt: "why do you want to ban him?",
					default: "No reason",
					type: "string"
				},
      ]
    });
  }

  async run(msg, { user, reason }) {
    if (msg.guild.members.has(user)) {
			user = msg.guild.members.get(user.id);

			if (!user.bannable)
				return msg.reply("I cannot ban this user");

			if (msg.member.highestRole.position <= user.highestRole.position)
				return msg.reply("You can't ban someone who has a higher role position than you.");

			if (this.client.permissions(user).level >= 2 && !this.client.permissions(msg.member).level >= 3)
				return msg.reply("You need to have the `Administrator` permission in order to ban moderators");

			if (this.client.permissions(user).level >= 3 && msg.guild.ownerId !== msg.member.id)
				return msg.reply("You need to be the server owner in order to ban Administrators")
		}
    await msg.guild.ban(user.user ? user.user.id : user.id, reason);
    this.client.utils.sendOkMsg(msg, `${user.user ? user.user.tag : user.tag} was banned`);
    let em = this.client.utils.emojis;
    let e = this.client.utils.embed()
      .setTitle("User Banned")
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
      .setThumbnail(user.user ? user.user.displayAvatarURL() : user.displayAvatarURL())
      .setColor(0xC61919)
      .addField(em.user + " User", `**${user.user ? user.user.tag : user.tag}** [${user.user ? user.user.id : user.id}]`)
      .addField("👷 Moderator", `**${msg.author.tag}** [${msg.author.id}]`)
      .addField(em.message + " Reason", `${reason}`)
    return msg.guild.log(e);
  }
};