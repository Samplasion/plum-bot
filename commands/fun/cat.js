const AnimalCommand = require('./../../classes/AnimalCommand.js');

module.exports = class CatCommand extends AnimalCommand {
    constructor(client) {
        super(client, "cat");
    }
}