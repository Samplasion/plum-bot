const { CommandoClient, SQLiteProvider } = require("discord.js-commando")
const sqlite = require('sqlite')
const path = require("path")
const fs = require("fs")
const Enmap = require("enmap")
const CommandError = require("./classes/CommandError");
const Embed = require("./classes/Embed");

// ======== REQUIRED
const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(` [PING] ${new Date().toLocaleString()}`);
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://glitch-proxy.now.sh/plum-bot/`);
}, 200000);
http.get(`http://glitch-proxy.now.sh/plum-bot/`);

require("./classes/Guild.js");
require("./classes/GuildMember.js");
require("./classes/Message.js");
require("./classes/User.js");

const client = new CommandoClient({
  commandPrefix: "pl.",
  unknownCommandResponse: false,
  owner: ["280399026749440000"],
  invite: "https://discord.gg/",
  disableEveryone: true,
})

client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerGroups([
        ["commands", "Botkeeping Utilities"],
        ["moderation", "Moderation"],
        ["fun", "Fun"],
    ])
    //.registerDefaultCommands({
    //  help: false,
    //  ping: false,
    //  reload: false
    //})
    .registerCommandsIn(path.join(__dirname, 'commands'));

sqlite.open(path.join(__dirname, "settings.sqlite3")).then((db) => {
    client.setProvider(new SQLiteProvider(db));
});

fs.readdir('./events/', (err, files) => {
  if (err) console.error(err);
  console.log(` [LOAD] Loading a total of ${files.length} events.`);
  files.forEach(file => {
    const eventName = file.split(".")[0];
    const event = require(`./events/${file}`);
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
    client.emit("eventLoaded", eventName)
  });
});

const perms = require("./perms.js")
client.permissionLevels = []
perms.forEach(perm => client.permissionLevels.push(new perm(client)))
client.permissions = (member) => {
  var p = client.permissionLevels[0]
  client.permissionLevels.forEach(perm => {
    if (perm.validate(member)) p = perm
  })
  return p
}

client.db = require('./utils/database.js');

client.settings = new Enmap({ name: "settings" })
/*
client.settings.getGuildSettings = (guild) => {
  const def = client.defaultSettings;
  if (!guild) return def;
  const returns = {};
  const overrides = client.settings.get(guild.id) || {};
  for (const key in def) {
    if (key == "types") returns[key] = def[key] // replace the types, just to be sure it's up-to-date
    else returns[key] = overrides[key] || def[key]; // For every key that's not there, use the default one
  }
  client.settings.set(guild.id, returns)
  return returns;
};
client.settings.getSet = (guild, path = null) => {
  client.settings.getGuildSettings(guild)
  return path ? client.settings.get(guild, path) : client.settings.get(guild)
}
*/

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

client.global = new Enmap({ name: "global" });

var Utilities = require("./classes/Utilities");
client.utils = new Utilities(client)

client.login(process.env.TOKEN);

// LOGGERS
process
  .on('unhandledRejection', (err, p) => {
    console.error(err);
    client.utils.errors.unhandledRejection(err);
    // console.error(err, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err);
    client.utils.errors.uncaughtException(err);
    process.exit(1);
  });

module.exports = client;