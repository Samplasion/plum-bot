const { Command } = require('discord.js-commando');

module.exports = class RandTextCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'perms',
      aliases: ['myperms', 'permissions', 'my permissions'],
      group: 'util',
      memberName: 'perms',
      description: 'Lets you see your permission level.',
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
    let you = !user
    let perm = this.client.permissions(member)
    message.say(`${you ? "Your" : member.displayName+"'s" } permission level is: 

__**${perm.name}**__ [${perm.level}]
_${perm.description}_`)
  }
};