const { oneLine } = require('common-tags');
const Command = require('./../../classes/Command.js');

module.exports = class ReloadCmdCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reload',
			aliases: ['reload-command'],
			group: 'commands',
			memberName: 'reload',
			description: 'Reloads a command or command group.',
			details: oneLine`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Providing a command group will reload all of the commands in that group.
				Only the bot owner(s) may use this command.
			`,
			examples: ['reload some-command'],
			ownerOnly: true,
			guarded: true,
      minPerms: 9,
			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Which command or group would you like to reload?',
					type: 'group|command'
				}
			]
		});
	}

	async run(msg, args) {
		const { cmdOrGrp } = args;
		const isCmd = Boolean(cmdOrGrp.groupID);
		cmdOrGrp.reload();

		if(isCmd) {
			await this.client.utils.sendOkMsg(msg, `Reloaded the \`${cmdOrGrp.name}\` command.`);
		} else {
			await this.client.utils.sendOkMsg(
				msg,
				`Reloaded all of the commands in the \`${cmdOrGrp.name}\` group.`
			);
		}
		return null;
	}
};
