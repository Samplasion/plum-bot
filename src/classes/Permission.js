
/**
 * Represents a Permission to run a Command 
 */

class Permission {
    /**
     * 
     * @param {import("./Client")} client the client that instantiated this Permission
     * @param {number} level The numeric level
     * @param {string} name The permission's name
     * @param {string} desc The permission's description
     * @param {number} [stickiness=1] Whether this permission should be kept even if a higher one matches.
     */
    constructor(client, level, name, desc, stickiness = 1) {
        this.client = client;
        this.level = level;
        this.name = name;
        this.description = desc;
        this.stickiness = stickiness;
    }

    /**
     * @param {import("./GuildMember")} member 
     */
    validate(member) {
        throw new TypeError(`Not implemented: Level ${this.level}.`);
    }
}

module.exports = Permission