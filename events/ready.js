const fs = require("fs");

module.exports = async client => {
  console.log(`[Start] ${new Date()}`);
  try {
    const { id: rebootMsgID , channel: rebootMsgChan } = JSON.parse(fs.readFileSync('./reboot.json', 'utf8'));
    const m = await client.channels.get(rebootMsgChan).fetchMessage(rebootMsgID);
    await m.edit(`Rebooted! It took ${roundNumber(((Date.now() - m.createdTimestamp) / 1000), 2)} seconds`);
    fs.unlink('./reboot.json', ()=>{});
  } catch(O_o) {}
  client.user.setActivity("Shubs");
}