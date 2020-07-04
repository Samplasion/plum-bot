const Command = require('../../classes/Command');

module.exports = class RandTextCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ticket',
      group: 'util',
      memberName: 'ticket',
      description: 'Creates a ticket channel for support.',
      examples: ['ticket'],
      args: []
    });
  }

  async run(message, { user }) {
    if (!message.guild.me.hasPermission("MANAGE_CHANNELS"))
      return this.client.utils.sendErrMsg(message, 'I need the "Manage channels" permission '
        + "to create tickets. Ask a server admin for help with this.");
    
    let categoryName = message.guild.config.data.ticketcategory || "Support tickets";
    let category = message.guild.channels.cache
      .find(ch => ch.name.toLowerCase() == categoryName.toLowerCase());
    if (!category) {
      category = await message.guild.channels.create(categoryName, {
        type: "category"
      });
    }
  }
};