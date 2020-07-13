const fs = require("fs");

module.exports = async client => {
  console.log(`[START] ${new Date().toLocaleString()}`);
  console.log(`[START] Logged in as: ${client.user.tag} [${client.user.id}]`);
  
  // Edit message to say "Took N seconds"
  try {
    const { id: rebootMsgID , channel: rebootMsgChan } = JSON.parse(fs.readFileSync('./reboot.json', 'utf8'));
    const m = await client.channels.cache.get(rebootMsgChan).messages.fetch(rebootMsgID);
    await m.edit(`Rebooted! It took ${((Date.now() - m.createdTimestamp) / 1000).toFixed(1)} seconds`);
    fs.unlink('./reboot.json', ()=>{});
  } catch(O_o) {(O_o)}
  
  // Set "Playing" status
  client.user.setActivity(`plum-bot.xyz | pl.help`);
  console.log(`  [LOG] Set activity to: plum-bot.xyz | pl.help`);
  
  // Re-setup reminders
  Array.from(client.reminders.values()).forEach(user => {
    user.forEach(reminder => {
      (client.reminders.raw[reminder.userID] = client.reminders.raw[reminder.userID] || [])[reminder.id] = setTimeout(() => {
        client.utils.remindUser(client.users.cache.get(reminder.userID), reminder);
        client.users.fetch(reminder.userID).then(u => u.reminders.delete(reminder.id))
      }, reminder.date - Date.now());
    });
  });
  // Flushing reminders *after* triggering current ones so that the bot can catch up
  client.reminders.flush();
  
  // Stable release stuff
  if (process.env.BRANCH === "master") {
    const GBL = require('gblapi.js');
    client.apis = {};
    if (process.env.GBLTOKEN)
        client.apis.glenn = new GBL(client.user.id, process.env.GBLTOKEN, false);

    // eslint-disable-next-line no-inner-declarations
    function updateAPIs() {
        if (client.apis.glenn)
            client.apis.glenn.updateStats(client.guilds.cache.size);
    }
    updateAPIs();
    setInterval(updateAPIs, 15 * 60000);
  }

  for (let guild of client.guilds.cache.array()) {
    guild.updateInfo();
    setInterval(() => guild.updateInfo(), 10 * 60000);
  }
  
  /*
  client.users.cache.forEach(user => {
    if (user.bot) return;
    console.log(user.reminders.list);
    user.reminders.list.forEach(reminder => {
      setTimeout(() => {
        client.utils.remindUser(user, reminder);
      }, reminder.date - Date.now());
    });
    
    user.reminders.flush();
  });
  */
}