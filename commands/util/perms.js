const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');

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
    let member = user ? user : message.member
    return message.reply(`${this.client.permissions(member)}`)
  }
};