const   Command   = require('./../../classes/Command.js');
const { oneLine } = require('common-tags');

module.exports = class BanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bean',
            group: 'fakemod',
            memberName: 'bean',
            description: 'Beans an user.',
            details: oneLine`You can also bean someone who isn't in your server.
                To do so, just use the ID instead of the tag, name or ping.
                This permanently beans users.`,
            examples: ['bean @Someone#12234 obviously spamming'],
            guildOnly: true,
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
    let em = this.client.utils.emojis;
    let e = this.client.utils.embed()
        .setTitle("User Beaned")
        .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
        .setThumbnail(user.user ? user.user.displayAvatarURL() : user.displayAvatarURL())
        .setColor(0xC61919)
        .addField("<:bean:729346829405257731> User", `**${user.user ? user.user.tag : user.tag}** [${user.user ? user.user.id : user.id}]`)
        .addField(`${this.client.utils.emojis.moderator}Beaner`, `**${msg.author.tag}** [${msg.author.id}]`)
        .addField(em.message + " Reason", `${reason}`)
    return msg.channel.send(this.client.utils.emojis.ok + ` | ${user.user ? user.user.tag : user.tag} was beaned`, { embed: e });
  }
};