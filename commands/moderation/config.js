const Command = require('../../classes/Command');
const { RichEmbed } = require("discord.js");
const { inspect } = require("util");

module.exports = class ConfigCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'config',
            aliases: ["conf", "settings", "sets"],
            group: 'moderation',
            memberName: 'config',
            description: 'Changes the client configuration for the server',
            examples: ["conf set welcomeMessage Welcome, {{user}}, to this server!"],
            guildOnly: true,
            args: [
              {
                key: "action",
                label: "action flag",
                prompt: "what action do you want to follow?",
                type: "string",
                default: "view",
                // oneOf: ['view', 'set', "clear", "reset", "add"],
              },
              {
                key: "prop",
                label: "property",
                prompt: "what key do you want to edit?",
                type: "string",
                default: ""
              },
              {
                key: "value",
                prompt: "what should the value be?",
                type: "string",
                default: ""
              },
            ],
            minPerm: 3
        });
      this.actions = ['view', 'set', "clear", "reset", "add", "get"]
    }

    async run(message, { action, prop, value }) {
      this.client.settings.getGuildSettings(message.guild)
      const guildConf = this.client.settings.ensure(message.guild.id, this.client.defaultSettings);
      var key = prop;
      switch (action) {
        case "view":
          //let configProps = Object.keys(guildConf).map(prop => {
          //  return `${prop}  :  ${guildConf[prop]}\n`;
          //});
          // return message.channel.send(`The following are the server's current configuration:
          // \`\`\`js\n${configProps}\n\`\`\``);
          return message.channel.send(inspect(guildConf, {depth: 1, compact: false}), {code: "js"});
          break;
        case "add":
          if (!this.client.isOwner(message.author)) return message.reply("due to the nature of this action, it is restricted to the owner. Contact Samplasion#7901 if you **absolutely** need to add a key.");
          const types = ["bool", "string", "int", "uint", "nullablestring", "array"];
          var response = await this.client.utils.awaitReply(message, `What would the type be? [${types.join("/")}]`);
          
          if (types.includes(response.toLowerCase())) {
            var type = response;
            if (!key) return message.reply("Please specify a key to add");
            if (guildConf[key]) return message.reply("This key already exists in the settings");

            // One the settings is modified, we write it back to the collection
            var res = value;
            switch (type) {
              case "bool":
                res = this.booleanize(res)
                break;
              case "string":
                res = res;
                break;
              case "nullablestring":
                res = this.nullify(res)
                break;
              case "int":
                res = parseInt(res)
                break;
              case "uint":
                res = Math.abs(parseInt(res));
                break;
              case "array":
                return this.handleArray(message, prop, res, guildConf.types[key]);
              case "role":
                res = this.handleRole(message, res)
                break
              case "channel":
                res = this.handleChannel(message, res)
                break
            }
            this.client.settings.set(message.guild.id, res, prop);
            this.client.settings.set(message.guild.id, type, "types."+prop);
            message.reply(`guild configuration item ${prop} has been added with value \`${value}\` and type ${type}`);
          } else return message.reply(`\`type\` must be one of (${types.join(", ")})`);
          break;
        case "set":
          // We can check that the key exists to avoid having multiple useless, 
          // unused keys in the config:
          if(!this.client.settings.has(message.guild.id, prop)) {
            return message.reply("this key is not in the configuration.");
          }
          
          if(key.includes("types"))
            return message.reply("if you don't wanna mess with the configs and have to reset them, you better not touch the `types` key.");

          var type = guildConf.types[key].split("|")[0];
          var res = value;
          
          switch (type) {
            case "bool":
              if (!["true", "false", true, false].includes(value)) return message.reply(`${prop} must be one of (true, false)`);
              res = this.booleanize(res)
              break;
            case "string":
              res = res
              break;
            case "nullablestring":
              res = this.nullify(res)
              break;
            case "int":
              res = parseInt(res)
              break;
            case "uint":
              res = Math.abs(parseInt(res));
              break;
            case "array":
              return this.handleArray(message, prop, res, guildConf.types[key]);
            case "role":
              res = this.handleRole(message, res)
              break
            case "channel":
              res = this.handleChannel(message, res)
              break
          }
            
          this.client.settings.set(message.guild.id, res, prop);

          // We can confirm everything's done to the client.
          message.channel.send(`Guild configuration item \`${prop}\` has been changed to:\n\`${res}\``);
          break;
        case "clear":
        case "reset":
          // Throw the 'are you sure?' text at them.
          var response = await this.client.utils.awaitReply(message, `Are you sure you want to permanently clear/reset the configs? This **CANNOT** be undone. [yes/no]`);

          // If they respond with y or yes, continue.
          if (["y", "yes", "sure", "yep"].includes(response)) {

            // We delete the `key` here.
            // guildConf.delete();
            this.client.settings.set(message.guild.id, this.client.defaultSettings);
            message.reply(`The configs were successfully cleared.`);
          } else
          // If they respond with n or no, we inform them that the action has been cancelled.
          if (["n", "no", "cancel"].includes(response)) {
            message.reply("Action cancelled.");
          }
          break;
        case "get":
          if (!key) return message.reply("Please specify a key to view");
          if (!guildConf[key]) return message.reply("This key does not exist in the settings");
          var value = guildConf[key];
          message.reply(`The value of ${key} is currently ${value}`);
          break;
        default:
          return message.reply("unknown action, must be one of ("+this.actions.join(", ")+")")
      }
    }
  
    booleanize(str) {
      switch (str) {
        case "false":
          return false;
        case "true":
          return true;
      }
      return true;
    } 
  
  nullify(str) {
    if (str == "null") return null
    return str
  }
  
  async handleArray(message, path, value, itsType) {
    var key = message.guild.id
    var items = value.split("|")
    const subType = itsType.split("|")[1]
    items = items.map(item => this.handleTypes(subType, item, message))
    var response = await this.client.utils.awaitReply(message, `Do you want to replace the list, or simply add an item to it? [replace/add]`);

    if (["replace"].includes(response.toLowerCase())) {
      this.client.settings.set(key, items, path, true)
      message.channel.send(`Guild configuration item \`${path}\` has been changed to:\n\`"${this.client.settings.get(key, path).join("\", \"")}"\``);
    } else if (["add"].includes(response.toLowerCase())) {
      items.forEach(i => this.client.settings.push(key, i, path, true)) // true is if there should be duplicate elements
      message.channel.send(`Guild configuration item \`${path}\` has been changed to:\n\`"${this.client.settings.get(key, path).join("\", \"")}"\``);
    }
    
  }
  
  handleRole(message, val) {
    var key = message.guild.id
    var value = val.trim()
    var items = this.client.utils.isId(value.replace("<@&", "").replace(">", "")) ? value.replace("<@&", "").replace(">", "") : message.guild.roles.find(it => it.name == value || it.name.includes(value)).id
    
    return items.toString()
  }
  
  handleChannel(message, val) {
    var key = message.guild.id
    var value = val.trim()
    var items = this.client.utils.isId(value.replace("<#", "").replace(">", "")) ? value.replace("<#", "").replace(">", "") : message.guild.channels.find(it => it.name == value || it.name.includes(value)).id
    
    return items.toString()
  }
  
  handleTypes(type, re, message) {
    var res = re
    switch (type) {
            case "bool":
              res = this.booleanize(res)
              break;
            case "string":
              res = res
              break;
            case "nullablestring":
              res = this.nullify(res)
              break;
            case "int":
              res = parseInt(res)
              break;
            case "uint":
              res = Math.abs(parseInt(res));
              break;
            case "role":
              res = this.handleRole(message, res)
            case "channel":
              res = this.handleChannel(message, res)
          }
    return res
  }
};