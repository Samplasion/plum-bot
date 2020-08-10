const PlumClient = require("./classes/Client")
const fs = require("fs")
const { join } = require("path");
const dirname = __dirname;
const humanizeDuration = require("humanize-duration");

// Extensions
if (!Math.clamp)
    Math.clamp = (value, min, max) => Math.max(Math.min(value, max), min);
if (!Number.prototype.clamp) {
    Number.prototype.clamp = function(min, max) {
        return Math.clamp(this, min, max);
    }
}
if (!String.prototype.slugify) {
    String.prototype.slugify = function() {
        return this.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\s-]+/g, "");
    }
}
global.asset = (...names) => {
    if (/\.js(on)?$/gi.test(names[names.length-1]))
        return require(join(dirname, '..', "assets", ...names));
    return fs.readFileSync(join(dirname, '..', "assets", ...names));
}
/** @type {(ms: number) => string} */
global.humanize = humanizeDuration.humanizer({
    round: true,
    conjunction: " and ",
    serialComma: false
});

// Import env variables
require('dotenv').config()

require("./classes/Guild.js");
require("./classes/GuildMember.js");
require("./classes/Message.js");
require("./classes/NewsChannel.js");
require("./classes/TextChannel.js");
require("./classes/User.js");

const client = new PlumClient();

const { load } = require("./utils/logger")

// Load Events
fs.readdir(join(dirname, 'events'), (err, files) => {
  if (err) console.error(err);
  load(`Loading a total of ${files.length} events.`);
  files.forEach(file => {
    const eventName = file.split(".")[0];
    const event = require(`./events/${file}`);
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];

    client.emit("eventLoaded", eventName)
  });
});


/*
client.configs.getGuildSettings = (guild) => {
  const def = client.defaultSettings;
  if (!guild) return def;
  const returns = {};
  const overrides = client.configs.get(guild.id) || {};
  for (const key in def) {
    if (key == "types") returns[key] = def[key] // replace the types, just to be sure it's up-to-date
    else returns[key] = overrides[key] || def[key]; // For every key that's not there, use the default one
  }
  client.configs.set(guild.id, returns)
  return returns;
};
client.configs.getSet = (guild, path = null) => {
  client.configs.getGuildSettings(guild)
  return path ? client.configs.get(guild, path) : client.configs.get(guild)
}
*/

client.login(process.env.TOKEN);

require("./site.js")(client);

/* LOGGERS
process
  .on('unhandledRejection', (err, p) => {
    console.error(err);
    if (err.message !== "404: Not Found") client.utils.errors.unhandledRejection(err);
    // console.error(err, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err);
    client.utils.errors.uncaughtException(err);
    process.exit(1);
  });
*/
module.exports = client;
