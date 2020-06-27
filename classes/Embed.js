const { MessageEmbed } = require("discord.js");

module.exports = class PlumEmbed extends MessageEmbed {
  constructor(client, ...args) {
    super(...args);
    this.setFooter("");
    this.setColor(0xC44040);
    this.setAuthor(client.user.username, client.user.avatarURL());
  }
  
  setFooter(name) {
    return super.setFooter((name ? name + " • " : "") + `Plum is made by Samplasion#0325`);
  }
  
  setFullFooter(name) {
    return super.setFooter(name);
  }
}