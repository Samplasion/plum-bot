/**
 * A translation lib based on i18next
 * @author Skillz4Killz
 */

const { warn, log, debug } = require("./logger.js");
const { realpathSync, readdirSync, statSync } = require("fs");
/** @type {import("i18next").default} */
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");

/**
 * @param {string} guildID 
 * @param {string} key 
 * @param {unknown} [options] 
 */
function translate(client, guildID, key, options) {
    const guild = client.guilds.resolve(guildID);

    let language = guild ? guild.config.get("lang") || "en_US" : "en_US";

    // const language = botCache.guildLanguages.get(guildID) ||
    //   guild.preferredLocale || "en_US";
  
    const languageMap = i18next.getFixedT(language) ||
        i18next.getFixedT("en_US");
  
    return languageMap(key, { domain: process.env.DOMAIN, ...options });
}
  

/**
 * @param {string} path 
 * @param {string[]} namespaces 
 * @param {string} folderName 
 */
async function determineNamespaces(path, namespaces = [], folderName = "") {
    const files = readdirSync(realpathSync(path));

    for (const file of files) {
        if (statSync(realpathSync(path + "/" + file)).isDirectory()) {
            const isLanguage = file.includes("-") || file.includes("_");

            namespaces = await determineNamespaces(
                `${path}/${file}`,
                namespaces,
                isLanguage ? "" : `${file}/`,
            );
        } else {
            namespaces.push(
                `${folderName}${file.substr(0, file.length - 5)}`,
            );
        }
    }

    return [...new Set(namespaces)];
}

async function loadLanguages() {
    const namespaces = await determineNamespaces(
        realpathSync("./src/languages"),
    );
    const languageFolder = [
        ...readdirSync(realpathSync("./src/languages")),
    ];

    await i18next
        .use(Backend)
        .init({
            initImmediate: false,
            fallbackLng: "en_US",
            interpolation: { escapeValue: false },
            load: "all",
            lng: "en-US",
            nonExplicitSupportedLngs: true,
            // supportedLngs: languageFolder,
            saveMissing: true,
            missingKeyHandler: function (lng, ns, key, fallbackValue) {
                const response =
                    `Missing translation key: ${lng}/${ns}:${key}. Instead using: ${fallbackValue}`;
                warn(response);
            },
            preload: languageFolder.map((file) => {
                return !/\.json$/.test(file) ? file : undefined
            }).filter(name => name),
            ns: namespaces,
            backend: {
                loadPath: `${realpathSync("./src/languages")}/{{lng}}/{{ns}}.json`,
                // loadPath(lng, ns) {
                //     debug(lng, ns);
                //     return `${realpathSync("./src/languages")}/${lng}/${ns}.json`
                // }
            },
        }, undefined);

    return i18next;
}

module.exports = {
    translate,
    determineNamespaces,
    loadLanguages
}