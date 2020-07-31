const signs = require("../../../assets/json/zodiac.json");
module.exports = {
    name: "Zodiac sign",
    description: "Used by the `horoscope` command.",
    oneOf: signs,
    type: "string",
    extendable: false,
    render: str => str[0].toUpperCase() + str.substr(1)
}