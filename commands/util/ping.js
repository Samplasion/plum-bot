const { oneLine } = require('common-tags');
const { Command } = require('./../../classes/Command.js');

module.exports = class PingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ping',
			group: 'util',
			memberName: 'ping',
			description: "It... like... pings. And then pongs. And it's not ping pong!",
			throttling: {
				usages: 5,
				duration: 10
			}
		});
	}

	async run(msg) {
    const pingMsg = await msg.reply(':ping_pong: Ping...');
    let pingembed = this.client.utils.embed()
      .setTitle("Ping!")
      .setDescription(":ping_pong: Pong!")
//    .setColor("#15f153")
      .addInline("Ping time", (new Date().getTime() - pingMsg.createdTimestamp + " ms"))
      .addInline("Heartbeat", `${Math.round(this.client.ping)} ms`)

    pingMsg.edit(pingembed);
	}
};