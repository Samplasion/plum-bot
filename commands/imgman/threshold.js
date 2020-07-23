const SRACanvasCommand = require('./../../classes/SRACanvasCommand.js');

module.exports = class GayCommand extends SRACanvasCommand {
    constructor(client) {
        super(client, {
            name: "threshold",
            punchline: "Here's your (quite literally) black and white image."
        })
    }
}