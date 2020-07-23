// @ts-ignore
const { Structures } = require('discord.js');

// This extends Discord's native GuildMember class with our own methods and properties
// @ts-ignore
module.exports = Structures.extend("GuildMember", GuildMember => class extends GuildMember {
    // @ts-ignore
    constructor(...args) {
        super(...args);
        this.DBinit();

        // Whether a member.ask(channel, text) is running;
        this.questioning = false;
    }

    get level() {
        return this.client.permissions(this);
    }

    DBinit() {
        let user = this;
        let guild = this.guild;
        this.points = {
            get db() {
                return require("../utils/database").levels;
            },
            get data() {
                this.ensure();
                return this.db.find({ guildID: guild.id, userID: user.id })[0];
            },
            ensure() {
                if (!this.db.data.map(o => `${o.userID}-${o.guildID}`).includes(`${user.id}-${guild.id}`)) {
                    this.setDefault();
                }
                return this;
            },
            setDefault() {
                let defaultSettings = {
                    userID: user.id,
                    guildID: guild.id,
                    points: 0,
                    level: 1
                };

                this.db.insert(defaultSettings);
                return defaultSettings;
            },
            check() {
                this.ensure();
                let data = this.data;
                let curLevel = data.level;
                let newLevel = Math.floor(0.1 * Math.sqrt(data.points));
                data.level = newLevel;

                this.db.update(data);

                return newLevel > curLevel;
            },
            award(points = 1) {
                this.ensure();
                let data = this.data;
                data.points += points;
                this.db.update(data);
                return this.check();
            },
            detract(points = 1) {
                this.ensure();
                let data = this.data;
                data.points -= points;
                this.db.update(data);
                return this.check();
            },
        }

        this.warns = {
            get db() {
                return require("../utils/database").infractions;
            },
            get data() {
                try {
                    return this.db.find({ guild: guild.id, user: user.id }) || [];
                } catch {
                    return [];
                }
            },
            add(reason, issuer) {
                let index = 0;
                if (this.data.length) {
                    index = this.data[this.data.length-1].id + 1;
                }

                this.db.insert({
                    guild: guild.id,
                    user: user.id,
                    reason,
                    id: index,
                    issueDate: new Date(),
                    lastEditDate: null,
                    issuer
                });

                return index;
            },
            edit(index, reason) {
                let data = this.data.filter(obj => {
                    return obj.guild == guild.id &&
                           obj.user == user.id &&
                           obj.id == index;
                })[0];
                data.reason = reason;
                data.lastEditDate = new Date();

                this.db.update(data);

                return this;
            },
            delete(index) {
                this.db.chain().find({ index, guild: guild.id, user: user.id }).remove();
                return this;
            },
            clear() {
                this.db.chain().find({ guild: guild.id, user: user.id }).remove();
                return this;
            },
            get(index) {
                return this.data.filter(obj => {
                    return obj.guild == guild.id &&
                           obj.user == user.id &&
                           obj.id == index;
                })[0];
            },
            has(index) {
                return !!this.get(index);
            }
        }
    }

    /** 
     * @param {*} channel 
     * @param {string} question 
     */
    async ask(channel, question) {
        if (this.questioning)
            throw new Error("This member already has a question running.");
        
        this.questioning = true;
        
        // SMERLIR Tactic
        if (this.guild.me.hasPermission("MANAGE_MESSAGES")) {
            // Send MEssage
            let msg = await channel.send(question);

            // React
            await msg.react(this.client.utils.emojis.ok);
            await msg.react(this.client.utils.emojis.error);

            // LIsten
            // @ts-ignore
            const filter = (reaction, user) => {
                return (reaction.emoji.toString() === this.client.utils.emojis.ok || reaction.emoji.toString() == this.client.utils.emojis.error) &&
                    user.id === this.id;
            };
            
            try {
                let react = await msg.awaitReactions(filter, {
                    max: 1,
                    time: 60000,
                    errors: ['time']
                });

                this.questioning = false;

                // Return
                return react.size && react.first().emoji.toString() == this.client.utils.emojis.ok;
            } catch (e) {
                this.questioning = false;

                return false;
            }
        }

        // @ts-ignore
        const filter = m => m.author.id == this.id;
        await channel.send(`${question} [Y/N]`);
        try {
            const collected = await channel.awaitMessages(filter, {
                max: 1,
                time: 60000,
                errors: ["time"]
            });
            this.questioning = false;
            return ["ok", "yes", "yeah", "y", "sure", "why not", "ya", "ye", "yay", "lets go", "let's go"]
                .includes(collected.first().content.toLowerCase().trim());
        } catch (e) {
            this.questioning = false;
            return false;
        }
    }

    async question(channel, question) {
        const filter = m => m.author.id == this.user.id;
		await channel.send(question);
		try {
			const collected = await channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });
			return collected.first().content;
		} catch (e) {
			return null;
		}
    }
})
