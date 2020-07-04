module.exports = class RoleType {
	static get nullValue() {
		return null;
	}

	static get id() {
		return "role";
	}

	static serialize(client, msg, val) {
		const matches = val.match(/(?:<@&)?(\d{17,19})>?/);
		if (matches)
			return matches[1];

		let name = msg.guild.roles.cache.filter(r => r.id != r.guild.id).find(c => {
			// console.log(require("util").inspect(c, {depth: 0}), c.name, c.type);
			return c.name.toLowerCase() == val.toLowerCase();
		});
		if (name) return name.id;

		return this.nullValue;
	}
	
	static deserialize(client, msg, val) {
		return val ? msg.guild.roles.cache.get(val) : this.nullValue;
	}

	static render(client, msg, val) {
		let chan = this.deserialize(client, msg, val);
		return chan ? `<@&${chan.id}>` : this.nullValue;
	}

	static validate(client, msg, val) {
		try {
			let isID = /(?:<@&)?(\d{17,19})>?/.test(val);
			let isName = !!msg.guild.roles.cache.filter(r => r.id != r.guild.id).find(c => c.name.toLowerCase() == val.toLowerCase());
			return isName || isID;
		} catch (e) {
			console.error(e);
			return false;
		}
	}
}