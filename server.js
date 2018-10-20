const { CommandoClient } = require("discord.js-commando")
const sqlite = require('sqlite')
const path = require("path")
const fs = require("fs")

// ======== REQUIRED
const http = require('http');
const express = require('express');
const app = express();
/*app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
// app.listen(process.env.PORT);*/
app.get("/", (request, response) => {
  console.log("Pinged")
});
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const client = new CommandoClient({
  commandPrefix: "!",
  unknownCommandResponse: false,
  owner: ["307980990587076608", "280399026749440000"],
  invite: "https://discord.gg/UgdQhV5",
  disableEveryone: true,
})

client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerGroups([
        ["moderation", "Moderation"],
        ["fun", "Fun"]
    ])
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.login(process.env.TOKEN)