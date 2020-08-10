const signs = asset("json", "ch-zodiac.json");
module.exports = {
    name: "Chinese Zodiac sign",
    description: "Used by the `horoscope` command.",
    oneOf: signs,
    type: "string",
    extendable: false,
    render: str => str[0].toUpperCase() + str.substr(1)
}