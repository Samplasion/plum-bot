const Command = require('../../classes/Command');
const Embed = require("../../classes/Embed");

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'changelog',
      aliases: ["log"],
			group: 'util',
			memberName: 'changelog',
			description: 'Logs a new change to the #changelog channel in the support server.',
			details: 'Only the bot owner(s) may use this command.',
			ownerOnly: true,

			args: [
        {
          key: "version",
          prompt: "What's the new version number?",
          type: "string",
          validate: text => {
            let regex = /\d\.\d\.\d/g;
            return regex.test(text);
          }
        },
				{
					key: 'log',
					prompt: 'What\'s new?',
					type: 'string'
				}
			]
		});
	}

	async run(msg, { version, log }) {
    if (!this.client.global.has("changelog-channel"))
      return this.client.utils.sendErrMsg(msg, "There is no changelog channel. Set one before changelogging stuff.");
    
    let changelogChannel = await this.client.channels.fetch(this.client.global.get("changelog-channel"));
    
    if (!changelogChannel || !changelogChannel.send)
      return this.client.utils.sendErrMsg(msg, "The changelog channel isn't an actual channel. " 
                                         + "Set a valid one before changelogging stuff.");
    
    try {
      let embed = new Embed(this.client)
        .setTitle(`What's new in version ${version}`)
        .setDescription(log)
        .setFullFooter("");

      changelogChannel.send(embed.shit());

      this.client.utils.sendOkMsg(msg, "The changelog was sent! Don't forget to bump the version number in `package.json`!");
    } catch (e) {
      this.client.utils.sendErrMsg(msg, "The changelog wasn't sent! Check the error logs to know why.");
      throw e;
    }
	}
};
