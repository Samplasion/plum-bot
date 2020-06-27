const Command = require('../../classes/Command');
const exec = require("util").promisify(require("child_process").exec);
const { MessageAttachment } = require("discord.js");

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reboot',
      aliases
			group: 'util',
			memberName: 'reboot',
			description: 'Executes bash scripts.',
			details: 'Only the bot owner(s) may use this command.',
			ownerOnly: true,

			args: [
				{
					key: 'script',
					prompt: 'What code would you like to execute?',
					type: 'string'
				}
			]
		});

		this.lastResult = null;
	}

	async run(msg, { script }) {
    const client = this.client;
		const channel = msg.channel;
		const message = msg;

		try {
			let result = await exec(script).catch((err) => { throw err; });

			const output = result.stdout ? "```sh\n" + result.stdout + "```" : "";
			const outerr = result.stderr ? "```sh\n" + result.stderr + "```" : "";

			if (output.includes(this.client.token)) output = output.replace(this.client.token, '"If someone tried to make you output the token, you were likely being scammed."')
			if (outerr.includes(this.client.token)) outerr = outerr.replace(this.client.token, '"If someone tried to make you output the token, you were likely being scammed."')

			if (output.length > 1990) {
				return msg.channel.send(new MessageAttachment(Buffer.from(output), "output.txt"));
			}
			if (outerr.length > 1990) {
				return msg.channel.send(new MessageAttachment(Buffer.from(outerr), "outerr.txt"));
			}

			msg.channel.send(!!outerr ? outerr : output)

		} catch(err) {
			console.error(err)

			const error = err.toString().replace(this.client.token, '"If someone tried to make you output the token, you were likely being scammed."')
			return msg.channel.send(error, {code: 'bash'})
		}

	}
};
