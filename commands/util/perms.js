const Command = require('../../classes/Command');

module.exports = class RandTextCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'perms',
      aliases: ['myperms', 'permissions'],
      group: 'util',
      memberName: 'perms',
      description: 'Lets you see your permission level.',
      examples: ['perms'],
      formatExplanation: {
        "[user]": "The user you wat to see the permissions of (defaults to you)"
      },
      args: [
        {
          key: "user",
          type: "member",
          prompt: "who do you want to see the permissions of?",
          default: ""
        }
      ]
    });
  }

  run(message, { user }) {
    // If pinged user, that. Otherwise message member
    let member = user || message.member
    let perm = this.client.permissions(member)
    message.channel.send(this.client.utils.fastEmbed("Permission level", `**${perm.name}** [${perm.level}]\n${perm.description}`)
      .setAuthor(member.displayName, member.user.displayAvatarURL()))
  }
};