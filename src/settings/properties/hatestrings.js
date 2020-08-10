const { oneLine } = require("common-tags");

module.exports = {
    name: "Swear list",
    type: "string",
    extendable: true,
    short: true,
    description: oneLine`This is a list of words that will trigger the hateful message
    block trigger. The words will automatically be converted to a useful format (e.g.
    it's perfectly fine for you to write "crêpe" and it will automatically match
    "crepe" and "cr3pe" as well).`,
    category: "Anti-swear filter"
} 