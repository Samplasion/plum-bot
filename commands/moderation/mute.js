const Command = require('./../../classes/Command.js');
const { oneLine } = require('common-tags');

module.exports = class UnMuteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            group: 'moderation',
            aliases: ['unmute'],
            memberName: 'mute',
            description: 'Mutes/Unmutes an user.',
            details: oneLine`Requires the "Muted role" config value to exist
      and be a role lower than Plum's highest role.
      Requires the mute role to be already configured.
      You can only mute someone who is in your server.
      Calling this command on a user who's already muted unmutes them.`,
            examples: [
                'mute @Mr®#6060 SHUT UP',
                "unmute @Mr®#6060 OK you've been quiet for long enough",
            ],
            permLevel: 2,
            guildOnly: true,
            clientPermissions: ['MANAGE_ROLES'],
            args: [
                {
                    key: 'user',
                    type: 'member',
                    prompt: 'Please provide a user to mute.',
                },
                {
                    key: 'reason',
                    prompt: 'why do you want to ban him?',
                    default: 'No reason',
                    type: 'string',
                },
            ],
        });
    }

    async run(msg, { user, reason }) {
        let role = msg.guild.config.data.mutedrole;
        if (!role)
            return msg.error("There isn't a \"Muted role\". Set it in the configuration (" + msg.prefix + "**config**)");

        role = await msg.guild.roles.fetch(role);

        let mute = user.roles.cache.has(role.id) ? "unmute" : "mute";

        if (msg.guild.me.roles.highest.position <= role.position)
            return msg.error("I cannot manage the \"Muted role\" because it's in a higher position than my roles.");

        if (msg.member.roles.highest.position <= user.roles.highest.position)
            return msg.error(`You can't ${mute} someone who has a higher role position than you.`);

        if (this.client.permissions(user).level >= 2 && !this.client.permissions(msg.member).level >= 3)
            return msg.reply(`You need to have the Administrator permission (level 3) in order to ${mute} moderators`);

        if (this.client.permissions(user).level >= 3 || user.roles.cache.some(role => role.permissions.has("ADMINISTRATOR")))
            return msg.reply('You can\'t mute Administrators');
        
        if (mute == "mute")
            user.roles.add(role);
        else
            user.roles.remove(role);

        msg.ok(`${user.user.tag} was ${mute}d`);
        let em = this.client.utils.emojis;
        let e = this.client.utils.embed()
            .setTitle(`User ${mute}d`)
            .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
            .setThumbnail(
                user.user.displayAvatarURL()
            )
            .setColor(0xe68600)
            .addField(
                em.user + ' User',
                `**${user.user ? user.user.tag : user.tag}** [${user.user ? user.user.id : user.id}]`
            )
            .addField(
                `${this.client.utils.emojis.moderator} Moderator`,
                `**${msg.author.tag}** [${msg.author.id}]`
            )
            .addField(em.message + ' Reason', `${reason}`);
        return msg.guild.log(e);
    }
};
