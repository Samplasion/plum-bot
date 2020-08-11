const Command = require('../../classes/Command');
const exec = require("util").promisify(require("child_process").exec);
const { MessageAttachment } = require("discord.js");

module.exports = class ExecCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'exec',
			group: 'commands',
			memberName: 'exec',
			description: 'Executes bash scripts.',
			details: 'Only the bot owner(s) may use this command.',
			ownerOnly: true,
            formatExplanation: {
                "<script>": "The bash snippet to run."
            },
      
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
        /* eslint-disable no-unused-vars */
        let client = this.client;
		let channel = msg.channel;
		let message = msg;
        /* eslint-enable no-unused-vars */

		try {
			let result = await exec(script).catch((err) => { throw err; });

			let output = result.stdout ? "```sh\n" + result.stdout + "```" : "";
			let outerr = result.stderr ? "```sh\n" + result.stderr + "```" : "";

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

			let error = err.toString().replace(this.client.token, '"If someone tried to make you output the token, you were likely being scammed."')
			return msg.channel.send(error, {code: 'bash'})
		}

	}
};
