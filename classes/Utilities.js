const Commando = require("discord.js-commando");
const { oneLine } = require('common-tags')
    , RichEmbed = require('discord.js')
    , List = require("list-array")

class Utilities {
  constructor(client) {
    this.client = client

    this.sendOkMsg = (msg, txt) => {
      return msg.channel.send(`:white_check_mark: | ${txt}`);
    }

    this.sendErrMsg = (msg, txt) => {
      return msg.channel.send(this.getErrStr(txt));
    }
    
    this.getGuildSettings = (guild) => {
      const def = client.defaultSettings;
      if (!guild) return def;
      const returns = {};
      const overrides = client.settings.get(guild.id) || {};
      for (const key in def) {
        if (key == "types") returns[key] = def[key] // replace the types, just to be sure it's up-to-date
        else returns[key] = overrides[key] || def[key]; // For every key that's not there, use the default one
      }
      return returns;
    };
    this.getSettings = this.getGuildSettings
    client.settings.ensureSets = (guild) => client.settings.set(guild.id, this.getGuildSettings(guild));
	}

  getErrStr(txt) {
    return `:negative_squared_cross_mark: | ${txt}`
  }

  embed() {
    return new RichEmbed()
      .setColor(0x008080)
  }

  plural(num, item) {
    var i = this.wordPlural(item)

    return `${num} ${i}`
  }
  
  wordPlural(num, item) {
    if (num == 1) return `${item}`
    
    var i = item;

    if (item.substr(-1) == "y")
      i = item.substr(0, item.length - 1) + "ies"
    else if (item.substr(-3) == "tch")
      i += "es"
    else i += "s"
    
    return i
  }

  // t      = Embed title
  // v      = Embed description
  // fieldArray = Embed fields (eg. [["Title1", "Value1"], ["Title2", "Value2", true]] )
  log(t, v, fieldArray) {
    // List (because of the forEach below)
    if (fieldArray) var fields = List.fromArray(fieldArray)

    // Ensures the list is [ "ownerID1", "ownerID2" ] regardless of type
    var owners = List.of(this.client.owner).flatten()

    // Creates the embed
    var logged = this.embed()
      .setTitle(t)
      .setDescription(v)

    if (fieldArray) {
      fields.forEach(([title, desc, inline]) => {
        logged.addField(title, desc, inline ? true : false)
      })
    }

    owners.forEach(owner => this.client.users.get(owner).send(logged))
  }

  async awaitReply(msg, question, limit = 60000) {
    const filter = m => m.author.id === msg.author.id;
    await msg.channel.send(question);
    try {
      const collected = await msg.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
      return collected.first().content;
    } catch (e) {
      return false;
    }
  };

  plural(num, item) {
    if (num == 1) return `${num} ${item}`

    var i = item;

    if (item.substr(-1) == "y")
      i = item.substr(0, item.length - 1) + "ies"
    else if (item.substr(-3) == "tch")
      i += "es"
    else i += "s"

    return `${num} ${i}`
  }
  
  clog(type, item) {
    var itemString = typeof item == "string" ? item : require("util").inspect(item)
    console.log(`[${type}] ${itemString}`)
  }
  
  isId(str) {
    return /^[0-9]{16,20}$/i.test(str)
  }
  
  pad(n) {
    return n < 10 ? `0${n}` : `${n}`
  }
  
  trim(str, lgt) {
    return str.replace(new RegExp(`/^(.{${lgt-1}}[^\s]*).*/`), "$1") + (lgt < str.length ? '…' : '')
  }
  
  get types() {
    return {
      owners: "array|role",
      admins: "array|role",
      mods: "array|role",
      welcomeMessage: "string",
      leaveMessage: "string"
    }
  }
}

module.exports = Utilities
