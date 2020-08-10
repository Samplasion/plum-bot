const SRACanvasCommand = require('../../classes/commands/SRACanvasCommand.js');

module.exports = class GayCommand extends SRACanvasCommand {
    constructor(client) {
        super(client, {
            name: "triggered",
            aliases: ["trigger"],
            api: "triggered",
            desc: "Trigger someone with this command!",
            punchline: "Here's your triggered avatar.",
            format: "gif"
        })
    }
}