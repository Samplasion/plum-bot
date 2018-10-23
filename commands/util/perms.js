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
    });
  }

  run(message) {
    return message.reply(message.member.permissionLevel)
  }
};