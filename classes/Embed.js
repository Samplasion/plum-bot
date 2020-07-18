const { MessageEmbed } = require("discord.js");

module.exports = class PlumEmbed extends MessageEmbed {
  constructor(client, ...args) {
    super(...args);
    this.setFooter("");
    this.setColor(client.color);
    this.setAuthor(client.user.username, client.user.avatarURL());
  }
  
  addInline(name, body) {
    return this.addField(name, body, true);
  }
  
  /**
   * 
   * @param {*} name 
   * @param {*?} icon 
   */
  setFooter(name, icon = "") {
    return this.setFullFooter((name ? name + " • " : "") + `Plum is made by Samplasion#0325`, icon);
  }
  
  /**
   * 
   * @param {*} name 
   * @param {*?} icon 
   */
  setFullFooter(name, icon = "") {
    return super.setFooter(name, icon);
  }
}