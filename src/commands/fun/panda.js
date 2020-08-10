const AnimalCommand = require('./../../classes/AnimalCommand.js');

module.exports = class PandaCommand extends AnimalCommand {
    constructor(client) {
        super(client, "panda");
    }
}