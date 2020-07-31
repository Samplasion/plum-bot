const Command = require('./../../classes/Command.js');
const { oneLine } = require('common-tags');

module.exports = class ScrambleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'decrypt',
      group: 'fun',
      aliases: ["dec"],
      memberName: 'decrypt',
      description: 'Decrypts what you say.',
      details: oneLine`
        This command takes what you say and decrypts it.
        It uses the so-called Caesar's Algorithm.
			`,
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

  run(message, args) {
    const encrypt = os => {
      var m = "";
      for (var i = 0; i < os.length; i++) {
        m += String.fromCodePoint(os.codePointAt(i) + 3)
      }
      return m
    };
    
    const decrypt = os => {
      var m = "";
      for (var i = 0; i < os.length; i++) {
        m += String.fromCodePoint(os.codePointAt(i) - 3)
      }
      return m
    };
    
    message.channel.send(decrypt(args.toDecrypt));
  }
};