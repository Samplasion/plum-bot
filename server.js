const PlumClient = require("./classes/Client")
const sqlite = require('sqlite')
const fs = require("fs")

// Import env variables
require('dotenv').config()

// ======== REQUIRED
const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(` [PING] ${new Date().toLocaleString()}`);
  response.sendStatus(200);
});
app.get("/vote/blspace", (req, res) => {
  console.log(req.body);
  res.status(200).send("lol");
})
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://glitch-proxy.now.sh/plum-bot/`);
}, 200000);
http.get(`http://glitch-proxy.now.sh/plum-bot/`);

require("./classes/Guild.js");
require("./classes/GuildMember.js");
require("./classes/Message.js");
require("./classes/User.js");

const client = new PlumClient();

// Load Events
fs.readdir('./events/', (err, files) => {
  if (err) console.error(err);
  console.log(` [LOAD] Loading a total of ${files.length} events.`);
  files.forEach(file => {
    const eventName = file.split(".")[0];
    const event = require(`./events/${file}`);
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];

    // @ts-expect-error
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

<<<<<<< HEAD
client.reminders = new Enmap({ name: "reminders" });
client.reminders.add = (user, reminder) => {
  var old = client.reminders.has(user.id) ? client.reminders.get(user.id) : [];
  old.push(reminder);
  client.reminders.set(user.id, old);
}
client.reminders.flush = () => {
  for (let [key, old] of client.reminders.entries()) {
    old = old.filter(r => r.date > Date.now());
    client.reminders.set(key, old);
  }
}
client.reminders.reset = (user) => {
  client.reminders.set(user.id, []);
}
client.reminders.list = (user) => {
  return client.reminders.get(user.id);
}
client.reminders.raw = {}

client.global = new Enmap({ name: "global" });

var Utilities = require("./classes/Utilities");
client.utils = new Utilities(client);

client.version = require("./version");

/**
 * @type {Map<string, number>}
 */
client.commandsRan = new Map();

=======
>>>>>>> 283a662aa93c3e85f5436f86529d570a1aa46829
client.login(process.env.TOKEN);

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
