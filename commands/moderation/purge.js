const Command = require('../../classes/Command');
const Embed = require("../../classes/Embed");

module.exports = class PurgeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'purge',
			group: 'moderation',
			memberName: 'purge',
			description: 'Purges a flooded channel.',
			details: '(Get it? Flooded... purge... no?)',

			args: [
        {
          type: "integer",
          key: "amount",
          label: "number of messages to purge (≤100)",
          default: 100,
          prompt: "how many messages do you want me to purge?",
          validate: text => parseInt(text) > 0 && parseInt(text) <= 100,
        }
      ]
		});
	}

	async run(msg, { amount }) {
    await msg.delete();
    
    let msgs = await msg.channel.messages.fetch({ limit: amount });
    msg.channel.bulkDelete(msgs);
    
    this.client.utils.sendOkMsg(msg, `${amount} message${amount == 1 ? "" : "s"} were successfully purged.`);
  }
}