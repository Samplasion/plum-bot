const Command = require("../../classes/Command");
const write = require("util").promisify(require("fs").writeFile);

module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: "reboot",
      aliases: ["restart"],
      group: "util",
      memberName: "reboot",
      description: "Reboots the bot.",
      details: "Only the bot owner(s) may use this command.",
      ownerOnly: true,

      args: []
    });

    this.lastResult = null;
  }

  async run(msg) {
    try {
      let rebootMessage = await msg.send("I'm rebooting...");
      await write(
        "./reboot.json",
        JSON.stringify({ id: rebootMessage.id, channel: msg.channel.id })
      );
    } catch {}

    process.exit();
  }
};
