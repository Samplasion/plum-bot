module.exports = class ChannelType {
	static get nullValue() {
		return null;
	}

	static get id() {
		return "channel";
	}

	static serialize(client, msg, val) {
		const matches = val.match(/(?:<#)?(\d{17,19})>?/);
		if (matches)
			return matches[1];

		let name = msg.guild.channels.cache.find(c => {
			// console.log(require("util").inspect(c, {depth: 0}), c.name, c.type);
			return c.name ? c.name.toLowerCase() : "" == val.toLowerCase() && c.type == "text";
		});
		if (name) return name.id;

		return this.nullValue;
	}
	
	static deserialize(client, msg, val) {
		return val ? msg.guild.channels.cache.get(val) : this.nullValue;
	}

	static render(client, msg, val) {
		let chan = this.deserialize(client, msg, val);
		return chan ? `<#${chan.id}>` : this.nullValue;
	}

	static validate(client, msg, val) {
		let channelIDregex = /(?:<#)?(\d{17,19})>?/;
		if (channelIDregex.test(val)) {
			let channelID = val.match(channelIDregex)[1];
			if (msg.guild.channels.cache.has(channelID))
				return true;
		}

		let isName = msg.guild.channels.cache.find(c => c.name ? c.name.toLowerCase() : "" == val.toLowerCase() && c.type == "text");
		if (isName)
			return true;

		return false;
	}

    static webRender(client, guild, val) {
		let chan = this.deserialize(client, { guild }, val);
		return chan ? `<#${chan.id}>` : this.nullValue;
    }

    static webInput(client, guild, val, name) {
		let chan = this.deserialize(client, { guild }, val);
        let s = `<div class="select"><select class="form-control" id="${name}" name="${name}">
        <option value="${this.nullValue}" ${!chan ? "selected" : ""}>None</option>`;
        guild.channels.cache.filter(c => c.type == "text" && c.sendable).forEach(channel => {
            s += `<option value="${channel.id}" ${chan && chan.id == channel.id ? "selected" : ""}>#${channel.name}</option>`;
        });
        s += "</select></div>";
        return s;
    }

    static webSerialize(client, guild, val) {
        if (guild.channels.cache.map(c => c.id).includes(val))
            return val;
        return this.nullValue;
    }
}