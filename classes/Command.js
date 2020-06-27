const { Command } = require('discord.js-commando');

module.exports = class PlumCommand extends Command {
  onError(err, message, args, fromPattern, result) { // eslint-disable-line no-unused-vars
		// super.onError(err, message, args, fromPattern, result);
    throw err;
	}
}