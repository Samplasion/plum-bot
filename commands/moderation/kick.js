const   Command   = require('./../../classes/Command.js');
const { oneLine } = require('common-tags');

module.exports = class KickCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kick',
      group: 'moderation',
      memberName: 'kick',
      description: 'Kicks an user away from the server.',
      examples: ['ban @free apps at discord.gg/spamServer obviously spamming'],
      permLevel: 2,
      guildOnly: true,
			clientPermissions: ["KICK_MEMBERS"],
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
    if (msg.guild.members.has(user.id)) {
			user = msg.guild.members.get(user.id);

			if (msg.member.highestRole.position <= user.highestRole.position)
				return msg.reply("You can't kick someone who has a higher role position than you.");

			if (this.client.permissions(user).level >= 2 && !this.client.permissions(msg.member).level >= 3)
				return msg.reply("You need to have the `Administrator` permission in order to kick moderators");

			if (this.client.permissions(user).level >= 3 && msg.guild.ownerId !== msg.member.id)
				return msg.reply("You need to be the server owner in order to kick Administrators")
		} else return msg.reply("you can't kick someone who isn't here already")
    await user.kick(reason)
    msg.channel.send(`${user.user.tag} was kicked`)
    let em = this.client.utils.emojis;
    let e = this.client.utils.embed()
      .setTitle("User Kicked")
      .setThumbnail(user.user.avatarURL())
      .setColor(0xF45C42)
      .addField(em.user + " User", `**${user.user ? user.user.tag : user.tag}** [${user.user ? user.user.id : user.id}]`)
      .addField("👷 Moderator", `**${msg.author.tag}** [${msg.author.id}]`)
      .addField(em.message + "📝 Reason", `${reason}`);
    
    return msg.guild.log(e);
  }
};