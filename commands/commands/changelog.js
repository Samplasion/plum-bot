const Command = require("../../classes/Command");
const Embed = require("../../classes/Embed");

module.exports = class ChangelogCommand extends Command {
  constructor(client) {
    super(client, {
      name: "changelog",
      aliases: ["log"],
      group: "commands",
      memberName: "changelog",
      description:
        "Logs a new change to the #changelog channel in the support server.",
      details: "Further improvements™ to overall system stability™ and other minor™ adjustments™ have been made to enhance™ the user experience™",
      ownerOnly: true,
      formatExplanation: {
          "<log>": "The changelog text.",
          "<version>": "The version of the changelog.",
      },

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
          key: "log",
          prompt: "What's new?",
          type: "string"
        }
      ]
    });
  }

  async run(msg, { version, log }) {
    if (!this.client.global.has("changelog-channel"))
      return this.client.utils.sendErrMsg(
        msg,
        "There is no changelog channel. Set one before changelogging stuff."
      );

    let changelogChannel = await this.client.channels.fetch(
      this.client.global.get("changelog-channel")
    );

    if (!changelogChannel || !changelogChannel.send)
      return this.client.utils.sendErrMsg(
        msg,
        "The changelog channel isn't an actual channel. " +
          "Set a valid one before changelogging stuff."
      );
    
      let embed = new Embed(this.client)
        .setTitle(`What's new in version ${version}`)
        .setDescription(log)
        .setFullFooter("");

      changelogChannel.send(embed);

      this.client.utils.sendOkMsg(
        msg,
        "The changelog was sent! Don't forget to bump the version number in `package.json`!"
      );
  }
};
