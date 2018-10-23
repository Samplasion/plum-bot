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
    const m = await client.channels.get(rebootMsgChan).fetchMessage(rebootMsgID);
    await m.edit(`Rebooted! It took ${((Date.now() - m.createdTimestamp) / 1000).toFixed(1)} seconds`);
    fs.unlink('./reboot.json', ()=>{});
  } catch(O_o) {}
  
  // Set "Playing" status
  const activityMessages = [`Help for ${client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} users`, `Help for ${client.channels.size.toLocaleString()} total channels`, `Type !help for a list of commands`];
  client.user.setActivity(activityMessages[1], {type: 0});
  let i = random(activityMessages.length-1);
  setInterval(() => {
    client.user.setActivity(activityMessages[i], {type: 0});
    i++;
    if (i == activityMessages.length) i = 0;
  }, 120000)
}