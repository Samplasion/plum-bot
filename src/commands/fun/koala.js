const AnimalCommand = require('./../../classes/AnimalCommand.js');

module.exports = class KoalaCommand extends AnimalCommand {
    constructor(client) {
        super(client, "koala");
    }
}