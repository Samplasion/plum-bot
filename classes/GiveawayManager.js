const { GiveawaysManager } = require("discord-giveaways");
const { giveaways } = require("../utils/database");

module.exports = class GiveawayManager extends GiveawaysManager {
    constructor(client) {
        super(client, {
            updateCountdownEvery: 10000,
            default: {
                botsCanWin: false,
                embedColor: "#FF0000",
                reaction: "🎉"
            }
        })
    }
 
    async getAllGiveaways() {
        // Get all the giveaway in the database
        return giveaways.data;
    }
 
    /**
     * @param {string} messageID 
     * @param {Object} giveawayData 
     */
    async saveGiveaway(messageID, giveawayData) {
        // Add the new one
        giveaways.insert(giveawayData)
        // Don't forget to return something!
        return true;
    }

    /**
     * @param {string} messageID 
     * @param {Object} giveawayData 
     */
    async editGiveaway(messageID, giveawayData) {
        let ga = giveaways.data.filter(g => g.messageID == messageID)[0];

        giveawayData.$loki = ga.$loki;
        giveawayData.meta = ga.meta;

        giveaways.update(giveawayData);

        return true;
    }
 
    /**
     * @param {string} messageID
     */
    async deleteGiveaway(messageID) {
        giveaways.removeWhere(ga => ga.messageID == messageID);
        
        return true;
    }
 
};