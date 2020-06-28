const fs = require("fs");

function random(a, b = 0) {
    var max = Math.max(a, b),
        min = Math.min(a, b)
    return ~~(Math.random() * (max - min) + min)
}

module.exports = async client => {
  console.log(`[Start] ${new Date().toLocaleString()}`);
  
  // Edit message to say "Took N seconds"
  try {
    const { id: rebootMsgID , channel: rebootMsgChan } = JSON.parse(fs.readFileSync('./reboot.json', 'utf8'));
    const m = await client.channels.cache.get(rebootMsgChan).messages.cache.get(rebootMsgID);
    await m.edit(`Rebooted! It took ${((Date.now() - m.createdTimestamp) / 1000).toFixed(1)} seconds`);
    fs.unlink('./reboot.json', ()=>{});
  } catch(O_o) {}
  
  // Set "Playing" status
  const activityMessages = [`Help for ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} users`, `Help for ${client.channels.cache.size.toLocaleString()} total channels`, `Type pl.help for a list of commands`];
  let i = random(activityMessages.length-1);
  client.user.setActivity(activityMessages[i], {type: 0});
  console.log("[LOG] Set status message:", activityMessages[i]);
  setInterval(() => {
    client.user.setActivity(activityMessages[i], {type: 0});
    console.log("[LOG] Set status message:", activityMessages[i]);
    i++;
    i %= activityMessages.length;
  }, 120000);
  
  // Re-setup reminders
  client.users.cache.forEach(user => {
    if (user.bot) return;
    console.log(user);
    user.reminders.list.forEach(reminder => {
      setTimeout(() => {
        client.utils.remindUser(user, reminder);
      }, reminder.date - Date.now());
    });
    
    // Flushing reminders *after* triggering current ones so that the bot can catch up
    user.reminders.flush();
  });
}