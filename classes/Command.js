const { Command } = require('discord.js-commando');
const CommandError = require("./CommandError");

module.exports = class PlumCommand extends Command {
  onError(err, message, args, fromPattern, result) { // eslint-disable-line no-unused-vars
		// super.onError(err, message, args, fromPattern, result);
    // throw new CommandError(err.message, message);
	}
}