const { ArgumentType } = require("discord.js-commando");

module.exports = class ZodiacSignType extends ArgumentType {
    constructor(client) {
        super(client, "zodiac");
        this.signs = require("../assets/json/zodiac.json");
    }

    isEmpty(val, msg, arg) {
        return this.client.registry.types.get("string").isEmpty(val, msg, arg);
    }

    validate(val, msg, arg) {
        return this.signs.includes(val.trim().toLowerCase());
    }

    parse(val) {
        return val.trim().toLowerCase();
    }
}