const { GiveawaysManager } = require("discord-giveaways");

module.exports = class GiveawayManager extends GiveawaysManager {
    constructor(client) {
        super(client, {
            storage: false,
            updateCountdownEvery: 10000,
            default: {
                botsCanWin: false,
                embedColor: "#FF0000",
                reaction: "🎉"
            }
        });
    }

    get db() {
        return require("../utils/database").giveaways;
    }
 
    async getAllGiveaways() {
        // Get all the giveaway in the database
        console.log(this.db);
        return this.db.data;
    }
 
    /**
     * @param {string} messageID 
     * @param {Object} giveawayData 
     */
    async saveGiveaway(messageID, giveawayData) {
        // Add the new one
        this.db.insert(giveawayData)
        // Don't forget to return something!
        return true;
    }

    /**
     * @param {string} messageID 
     * @param {Object} giveawayData 
     */
    async editGiveaway(messageID, giveawayData) {
        let ga = this.db.data.filter(g => g.messageID == messageID)[0];

        giveawayData.$loki = ga.$loki;
        giveawayData.meta = ga.meta;

        this.db.update(giveawayData);

        return true;
    }
 
    /**
     * @param {string} messageID
     */
    async deleteGiveaway(messageID) {
        this.db.removeWhere(ga => ga.messageID == messageID);
        
        return true;
    }
 
};