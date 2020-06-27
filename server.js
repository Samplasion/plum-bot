const { CommandoClient, SQLiteProvider } = require("discord.js-commando")
const sqlite = require('sqlite')
const path = require("path")
const fs = require("fs")
const Enmap = require("enmap")

// ======== REQUIRED
const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

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
        ["moderation", "Moderation"]
    ])
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

sqlite.open(path.join(__dirname, "settings.sqlite3")).then((db) => {
    client.setProvider(new SQLiteProvider(db));
});

fs.readdir('./events/', (err, files) => {
  if (err) console.error(err);
  console.log(`Loading a total of ${files.length} events.`);
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

client.defaultSettings = {
  owners: [],
  admins: [],
  mods: [],
  welcomeMessage: "",
  leaveMessage: ""
}

client.settings = new Enmap({ name: "settings" })
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

client.reminders = new Enmap({ name: "settings" });
client.reminders.add = (user, reminder) => {
  if (!client.reminders.has(user.id))
    client.reminders.set(user.id, []);
  client.reminders.set();
}

var Utilities = require("./classes/Utilities");
client.utils = new Utilities(client)

client.login(process.env.TOKEN)