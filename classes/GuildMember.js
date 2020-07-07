const { Structures } = require('discord.js');
const { findType } = require('../settings/index.js');
const databaseModule = require('../utils/database.js');

// This extends Discord's native GuildMember class with our own methods and properties
module.exports = Structures.extend("GuildMember", GuildMember => class extends GuildMember {
	constructor(...args) {
		super(...args);
		this.DBinit();
	}
  
  get level() {
    return this.client.permissions(this);
  }

	DBinit() {
		let user = this;
		let guild = this.guild;
    let client = this.client;
		this.points = {
      get data() {
        this.ensure();
        return client.points.get(`${user.id}-${guild.id}`) || this.setDefault();
      },
      ensure: () => {
        client.points.ensure(`${user.id}-${guild.id}`, {
          userID: user.id,
          guildID: guild.id,
          points: 0,
          level: 1
        })
      },
			setDefault: () => {

				let defaultSettings = {
					userID: user.id,
          guildID: guild.id,
          points: 0,
          level: 1
				};

				let currentSettings = client.points.get();
				if (currentSettings) {
					for (var key in defaultSettings) {
						currentSettings[key] = defaultSettings[key];
					}
				}

				client.points.set(`${user.id}-${guild.id}`, currentSettings || defaultSettings);
        return currentSettings || defaultSettings;
			},
      check: () => {
        let data = this.points.data;
        let curLevel = data.level;
        let newLevel = Math.floor(0.1 * Math.sqrt(data.points));
        
        client.points.set(`${user.id}-${guild.id}`, newLevel, "level");
        
        if (newLevel > curLevel) {
          return true
        }
        
        return false;
      },
			award(points = 1) {
				let curPoints = this.data.points;
        client.points.math(`${user.id}-${guild.id}`, "+", points, "points");
        return this.check();
			},
			detract(points = 1) {
				let curPoints = this.data.points;
        client.points.math(`${user.id}-${guild.id}`, "-", points, "points");
        return this.check();
			},
		}
	}
  
  /**
   * @param {GuildChannel} channel 
   * @param {string} question 
   */
  async ask(channel, question) {
    // SMERLIR Tactic
    if (this.guild.me.hasPermission("MANAGE_MESSAGES")) {
      // Send MEssage
      let msg = await channel.send(question);
      
      // React
      await msg.react(this.client.utils.emojis.ok);
      await msg.react(this.client.utils.emojis.error);
      
      // LIsten
      const filter = (reaction, user) => {
        return (reaction.emoji.name === this.client.utils.emojis.ok || reaction.emoji.name == this.client.utils.emojis.error)
          && user.id === this.id;
      };

      let react = await msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }); 
      
      // Return
      return react.first().emoji.name == this.client.utils.emojis.ok;
    }
    
    /**
     * @param {Message} m 
     */
    const filter = m => m.author.id == this.id;
    await channel.send(`${question} [Y/N]`);
    try {
      const collected = await channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });
      return ["ok", "yes", "yeah", "y", "sure", "why not"].includes(collected.first().content.toLowerCase().trim());
    } catch (e) {
      return false;
    }
  }
})
