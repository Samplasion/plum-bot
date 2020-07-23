const SRACanvasCommand = require('./../../classes/SRACanvasCommand.js');

module.exports = class GayCommand extends SRACanvasCommand {
    constructor(client) {
        super(client, {
            name: "invert",
            punchline: "Here's your inverted image.",
        })
    }
}