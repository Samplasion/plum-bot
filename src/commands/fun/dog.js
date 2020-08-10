const AnimalCommand = require('./../../classes/AnimalCommand.js');

module.exports = class DogCommand extends AnimalCommand {
    constructor(client) {
        super(client, "dog");
    }
}