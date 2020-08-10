const Command = require('../../classes/commands/Command.js');
const { oneLine } = require('common-tags');

module.exports = class ScrambleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'decrypt',
      group: 'fun',
      aliases: ["dec"],
      memberName: 'decrypt',
      description: 'commands/encrypt:DESCRIPTION',
      details: "commands/encrypt:DETAILS",
      examples: ['decrypt wklv#lv#yhu|#kdug#wr#xqghuvwdqg'],
      formatExplanation: {
        "[text to decrypt]": "The string you want to decrypt."
      },
      args: [{
        key: 'toDecrypt',
        label: 'text to decrypt',
        prompt: 'What would you like me to decrypt?',
        type: 'string',
        infinite: false,
        default: "This command takes what you say and decrypts it. It uses the so-called Caesar's Algorithm."
      }]
    });
  }

  run(msg, args) {
    const decrypt = os => {
        var m = "";
        for (var i = 0; i < os.length; i++) {
          m += String.fromCodePoint(os.codePointAt(i) - 3)
        }
        return m
      };

    let embed = msg.makeEmbed(true)
        .setTitle(msg.t("commands/decrypt:TITLE"))
        .setDescription(decrypt(args.toDecrypt))
    
    msg.ok(msg.t("commands/decrypt:OK"), embed);
  }
};