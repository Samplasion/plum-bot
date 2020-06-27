const { RichEmbed } = require("discord.js");

module.exports = class PlumEmbed extends RichEmbed {
  constructor(...args) {
    super(...args);
    this.setFooter("");
  }
  
  setFooter(name) {
    super.setFooter((name ? name + " - " : "") + `${this.client.user.username} - made by Samplasion`);
  }
}