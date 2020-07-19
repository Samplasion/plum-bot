const AnimalCommand = require('./../../classes/AnimalCommand.js');

module.exports = class FoxCommand extends AnimalCommand {
    constructor(client) {
        super(client, "fox");
    }
}