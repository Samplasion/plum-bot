const { GuildManager } = require("discord.js");
const Guild = require("./Guild");

class PlumGuildManager extends GuildManager {
    constructor(client) {
        super(client);

        /** @type {import("discord.js").Collection.<string, Guild>} */
        this.cache;
    }
}

module.exports = PlumGuildManager;