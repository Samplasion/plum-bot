module.exports = class CommandType {
	static get nullValue() {
		return "";
	}

	static get id() {
		return "command";
	}

	static serialize(client, _, val) {
		let cmd = client.registry.commands.aliases.get(val);
		if (cmd)
			return cmd.id;

		return this.nullValue;
	}

	static deserialize(client, _, values) {
		if (!values) return this.nullValue;

		if (Array.isArray(values)) {
			let array = [];

			for (var value of values) {
				array.push(client.commandHandler.modules.get(value));
			}

			return array;
		}

		return client.commandHandler.modules.get(values);
	}

	static render(client, _, values) {
		let command;
		if (!values) return this.nullValue;

		if (Array.isArray(values)) {
			let array = [];

			for (var value of values) {
				command = this.deserialize(client, _, value);

				if (!command) continue;
				array.push(command.id);
			}

			return array;
		}

		command = this.deserialize(client, _, values);
		return command ? command.id : this.nullValue;
	}

	static validate(client, _, val) {
		let commands = Array.from(client.commandHandler.modules.keys());
		if (commands.filter(command => command === val).length)
			return true;

		return false;
	}

    static webRender(client, guild, val) {
		let cmd = this.deserialize(client, { guild }, val);
		return cmd ? `${client.commandPrefix}**${cmd.name}**` : this.nullValue;
    }

    static webInput(client, guild, val, name) {
		let c = this.deserialize(client, { guild }, val);
        let s = `<div class="select"><select class="form-control" id="${name}" name="${name}">
        <option value="${this.nullValue}" ${!c ? "selected" : ""}>None</option>`;
        client.registry.commands.filter(c => c.permLevel < 5).forEach(cmd => {
            s += `<option value="${cmd.name}" ${c && c.name == c.name ? "selected" : ""}>${cmd.name}</option>`;
        });
        s += "</select></div>";
        return s;
    }

    static webSerialize(client, guild, val) {
        let cmd = client.registry.findCommands(val, false, undefined);
        if (cmd)
            return cmd.name;
        return this.nullValue;
    }
}