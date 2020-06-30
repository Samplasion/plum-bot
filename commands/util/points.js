const Command = require('../../classes/Command');

module.exports = class RandTextCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'points',
      aliases: ['mypoints'],
      group: 'util',
      memberName: 'points',
      description: 'Lets you see how many points you have.',
      examples: ['perms'],
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
    return message.channel.send(`${member.id == user.id ? "You've" : member.displayName + "'s"} got ${member.points.data.points} points and are at level ${member.points.data.level}`);
  }
};