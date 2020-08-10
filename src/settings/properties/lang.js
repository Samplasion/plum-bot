let supported = require("../../languages/all.json");

module.exports = {
    name: "Language",
    oneOf: Object.keys(supported),
    type: "string",
    extendable: false,
    long: true,
    description: "Sets the language for the current server.",
    category: "Misc",
    render(str) {
        if (!str)
            return "Default (English)";

        let lang = supported[str];

        return `${lang.localizedName} (${lang.name})`;
    }
}