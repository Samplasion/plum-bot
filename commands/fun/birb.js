const AnimalCommand = require('./../../classes/AnimalCommand.js');

module.exports = class BirbCommand extends AnimalCommand {
    constructor(client) {
        super(client, "birb");
        this.aliases = ["bird"];
    }
}