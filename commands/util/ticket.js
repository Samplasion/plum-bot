const Command = require('../../classes/Command');

module.exports = class RandTextCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ticket',
      group: 'util',
      memberName: 'ticket',
      description: 'Creates a ticket channel for support.',
      examples: ['ticket', 'ticket delete 0'],
      guildOnly: true,
      args: [
        {
          key: "action",
          type: "string",
          oneOf: ["create", "add", "delete", "remove"],
          prompt: "",
          default: "create"
        },
        {
          key: "args",
          type: "string",
          prompt: "",
          default: ""
        }
      ]
    });
  }

  async run(message, { action, args }) {
    if (action == "add")    action = "create";
    if (action == "remove") action = "delete";
    return this[action](message, args);
  }

  async create(message) {
    if (!message.guild.me.hasPermission("MANAGE_CHANNELS"))
      return this.client.utils.sendErrMsg(message, 'I need the "Manage channels" permission '
        + "to create and remove tickets. Ask a server admin for help with this.");
    
    // Find or create the category
    let categoryName = message.guild.config.data.ticketcategory || "Support tickets";
    let category = message.guild.channels.cache
      .find(ch => ch.name.toLowerCase() == categoryName.toLowerCase());
    if (!category) {
      category = await message.guild.channels.create(categoryName, {
        type: "category"
      });
    }

    // Create a new channel
    let name = message.guild.channels.cache.filter(ch => ch.parent && ch.parent.name == categoryName).size;
    while (message.guild.channels.cache.map(ch => ch.name).includes(`ticket-${name.toString().padStart(4, "0")}`)) {
      name++;
    }

    let perms = [
      "SEND_MESSAGES",
      "READ_MESSAGE_HISTORY",
      "VIEW_CHANNEL"
    ]
    let permissionOverwrites = [
      {
        id: message.guild.id, // @everyone
        type: "role",
        deny: perms
      },
      {
        id: message.member.id,
        type: "member",
        allow: perms
      },
      {
        id: message.guild.me,
        type: "member",
        allow: perms
      }
    ];

    if (message.guild.config.data.helpers) {
      permissionOverwrites.push({
        id: message.guild.config.data.helpers,
        type: "role",
        allow: perms
      });
    }

    let channel = await message.guild.channels.create(`ticket-${name.toString().padStart(4, "0")}`, {
      type: "text",
      parent: category,
      topic: `Created by: <@${message.author.id}>`,
      permissionOverwrites
    });

    await this.client.utils.sendOkMsg(message, `Your ticket channel was successfully created here: <#${channel.id}>.`);
    return channel.send(`<@${message.author.id}>, here's your support ticket channel.`);
  }

  async delete(message, args) {
    let categoryName = message.guild.config.data.ticketcategory || "Support tickets";

    if (parseInt(args.trim()) == NaN || !args.trim())
      return this.client.utils.sendErrMsg(message, "The argument to `delete` must be a number "
        + "(don't include the leading zeros).");
    
    let tickets = message.guild.channels.cache.filter(ch => ch.parent && ch.parent.name == categoryName);
    let name = "ticket-" + args.trim().padStart(4, "0");

    if (!tickets.map(ch => ch.name).includes(name))
      return this.client.utils.sendErrMsg(message, `There's no ticket channel stored with that number in the ticket channel category of your server. A typo?`);

    let channel = message.guild.channels.cache.find(ch => ch.name == name);

    if (!channel.topic.includes(`<@${message.author.id}>`) && (this.client.permissions(message.member).level < 2 && !message.member.roles.cache.has(message.guild.config.data.helpers)))
      return this.client.utils.sendErrMsg(message, `The ticket channel doesn't belong to you and you have no rights over it.`);

    try {
      await channel.delete("Ticket channel expired.");

      if (message.channel.id != channel.id)
        return this.client.utils.sendOkMsg(message, "The ticket channel was successfully removed.");
    } catch (e) {
      if (message.channel.id != channel.id)
        return this.client.utils.sendErrMsg(message, `I'm lacking permissions to delete that channel!`);
    }
  }
};