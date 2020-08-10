const Command = require('./../../classes/commands/Command.js');
const { oneLine } = require("common-tags");
const { debug } = require('../../utils/logger.js');
 
module.exports = class LangCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lang',
            aliases: [],
            group: 'util',
            memberName: 'lang',
            description: "commands/lang:DESCRIPTION",
            args: [{
                key: "action",
                type: "string",
                prompt: "",
                default: "" 
            }],
            permLevel: 3
        });
    }
 
    async run(message, { action }) {
        /** @type {LanguageGroup} */
        let langs = require("../../languages/all.json");
        let keys = Object.keys(langs);

        for (let k of keys) {
            langs[k].code = k;
        }

        if (action == "list" || !action) {
            let list = ""
            keys.forEach(key => {
                let lang = langs[key];
                list += `• ${lang.flag} \`${lang.code}\` **${lang.localizedName}** (${lang.name})\n`
            })
            let ls = message.t("commands/lang:LIST", {
                list,
                prefix: message.prefix
            })
            message.info(ls)
        } else {
            if ((action.length != 5) || /[^a-z\-_]/gmi.test(action))
                return message.error(message.t("commands/lang:ERR_INVALID_CODE", { input: action }))

            if (keys.filter(l => l.toLowerCase() == action.toLowerCase()).length < 1)
                return message.combine([
                    {
                        type: "error",
                        message: message.t("commands/lang:ERR_NO_LANG_ERR", {
                            input: action
                        })
                    },
                    {
                        type: "info",
                        message: message.t("commands/lang:ERR_NO_LANG_INFO")
                    }
                ])
            let lang = langs[keys.filter(l => l.toLowerCase() == action.toLowerCase())[0]]
            // message.author.lang = lang.code
            // global.lang = message.author.lang
            message.guild.config.set("lang", lang.code);
            message.ok(message.t("commands/lang:LANG_SET", {
                flag: lang.flag,
                name: lang.name,
                localized: lang.localizedName
            }))
        }
    }
};