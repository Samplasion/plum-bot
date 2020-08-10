const Command = require('../../classes/commands/Command.js');
const { oneLine } = require('common-tags');

module.exports = class ScrambleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'encrypt',
      group: 'fun',
      aliases: ["enc"],
      memberName: 'encrypt',
      description: 'commands/encrypt:DESCRIPTION',
      details: "commands/encrypt:DETAILS",
      examples: ['encrypt this is very hard to understand'],
      formatExplanation: {
        "[text to encrypt]": "The string you want to encrypt."
      },
      args: [{
        key: 'toEncrypt',
        label: 'text to encrypt',
        prompt: 'What would you like me to encrypt?',
        type: 'string',
        infinite: false,
        default: "This command takes what you say and encrypts it. It uses the so-called Caesar's Algorithm."
      }]
    });
  }

  run(msg, args) {
    const encrypt = os => {
      var m = "";
      for (var i = 0; i < os.length; i++) {
        m += String.fromCodePoint(os.codePointAt(i) + 3)
      }
      return m
    };

    let embed = msg.makeEmbed(true)
        .setTitle(msg.t("commands/encrypt:TITLE"))
        .setDescription(encrypt(args.toEncrypt))
    
    msg.ok(msg.t("commands/encrypt:OK"), embed);
  }
};