const fs = require("fs");
function random(a, b = 0) {
    var max = Math.max(a, b),
        min = Math.min(a, b)
    return ~~(Math.random() * (max - min) + min)
}

module.exports = async client => {
  console.log(`[Start] ${new Date().toLocaleString()}`);
  try {
    const { id: rebootMsgID , channel: rebootMsgChan } = JSON.parse(fs.readFileSync('./reboot.json', 'utf8'));
    const m = await client.channels.get(rebootMsgChan).fetchMessage(rebootMsgID);
    await m.edit(`Rebooted! It took ${roundNumber(((Date.now() - m.createdTimestamp) / 1000), 2)} seconds`);
    fs.unlink('./reboot.json', ()=>{});
  } catch(O_o) {}
  const activityMessages = [`Help for ${client.guilds.size} total servers`, `Help for ${client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} users`, `Help for ${client.channels.size.toLocaleString()} total channels`, `Type !help for a list of commands`];
  client.user.setActivity(activityMessages[1], {type: 0});
  setInterval(() => {
    let i = random(activityMessages.length-1);
    client.user.setActivity(activityMessages[i], {type: 0});
    i++;
    if (i == activityMessages.length) i = 0;
  }, 1000)
}