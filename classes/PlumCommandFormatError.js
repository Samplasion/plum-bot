const { FriendlyError } = require('discord.js-commando');

/**
 * Has a descriptive message for a command not having proper format
 * @extends {FriendlyError}
 */
class PlumCommandFormatError extends FriendlyError {
	/**
	 * @param {CommandoMessage} msg - The command message the error is for
	 */
	constructor(msg) {
		super("Stub.");
		this.name = 'PlumCommandFormatError';
        this.messages = [
            {
                type: "error",
                message: `The command was called incorrectly.`
            },
            {
                type: "info",
                message: `The correct format is \`${msg.prefix}${msg.command.name}${msg.command.format ? " " + msg.command.format : ""}\`.`
            },
        ]
	}
}

module.exports = PlumCommandFormatError;
