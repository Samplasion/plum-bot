const SRACanvasCommand = require('../../classes/commands/SRACanvasCommand.js');

module.exports = class GayCommand extends SRACanvasCommand {
    constructor(client) {
        super(client, {
            name: "gay",
            api: "gay",
            punchline: "Here's your gay image."
        })
    }
}