const SRACanvasCommand = require('./../../classes/SRACanvasCommand.js');

module.exports = class GayCommand extends SRACanvasCommand {
    constructor(client) {
        super(client, {
            name: "gay",
            api: "gay",
            punchline: "Here's your gay image."
        })
    }
}