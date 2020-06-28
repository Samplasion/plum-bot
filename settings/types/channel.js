export default class ChannelType {
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

		let name = msg.guild.channels.find(c => {
			// console.log(require("util").inspect(c, {depth: 0}), c.name, c.type);
			return c.name ? c.name.toLowerCase() : "" == val.toLowerCase() && c.type == "text";
		});
		if (name) return name.id;

		return this.nullValue;
	}
	
	static deserialize(client, msg, val) {
		return val ? msg.guild.channels.get(val) : this.nullValue;
	}

	static render(client, msg, val) {
		let chan = this.deserialize(client, msg, val);
		return chan ? `<#${chan.id}>` : this.nullValue;
	}

	static validate(client, msg, val) {
		let channelIDregex = /(?:<#)?(\d{17,19})>?/;
		if (channelIDregex.test(val)) {
			let channelID = val.match(channelIDregex)[1];
			if (msg.guild.channels.has(channelID))
				return true;
		}

		let isName = msg.guild.channels.find(c => c.name ? c.name.toLowerCase() : "" == val.toLowerCase() && c.type == "text");
		if (isName)
			return true;

		return false;
	}
}