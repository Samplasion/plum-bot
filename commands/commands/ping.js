const { oneLine } = require('common-tags');
const Command = require('./../../classes/Command.js');

module.exports = class PingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ping',
			group: 'commands',
			memberName: 'ping',
			description: "It... like... pings. And then pongs. And it's not ping pong!",
			throttling: {
				usages: 5,
				duration: 10
			}
		});
	}

	async run(msg) {
    const pingMsg = await msg.say(':ping_pong: Pinging...');
    let pingembed = this.client.utils.embed()
      .setTitle("🏓 Ping!")
      .setDescription("Pong!")
      .addInline("⏱ Ping time", (new Date().getTime() - pingMsg.createdTimestamp + " ms"))
      .addInline("💗 Heartbeat", `${Math.round(this.client.ws.ping)} ms`)

    pingMsg.edit("", pingembed);
	}
};