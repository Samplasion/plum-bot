const SRACanvasCommand = require('../../classes/commands/SRACanvasCommand.js');

module.exports = class GayCommand extends SRACanvasCommand {
    constructor(client) {
        super(client, {
            name: "glass",
            api: "glass",
            punchline: "Here's your glassy (and glossy) image."
        })
    }
}