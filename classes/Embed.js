const { MessageEmbed } = require("discord.js");

module.exports = class PlumEmbed extends MessageEmbed {
  constructor(...args) {
    super(...args);
    this.setFooter("");
    this.setColor(0xC44040);
  }
  
  setFooter(name) {
    return super.setFooter((name ? name + " • " : "") + `Plum is made by Samplasion#0325`);
  }
}