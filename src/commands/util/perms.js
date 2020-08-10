const Command = require('../../classes/commands/Command');

module.exports = class RandTextCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'perms',
      aliases: ['myperms', 'permissions'],
      group: 'util',
      memberName: 'perms',
      description: 'commands/perms:DESCRIPTION',
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
    let embed = message.makeEmbed(true)
        .setTitle(message.t("commands/perms:TITLE"))
        .setDescription(`**${message.t(perm.name)}** [${perm.level}]\n${message.t(perm.description)}`);
    message.info(message.t("commands/perms:OK", { tag: member.user.tag }), embed)
  }
};