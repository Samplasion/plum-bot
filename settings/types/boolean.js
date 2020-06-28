module.exports = class BoolType {
	static get nullValue() {
		return false;
	}

	static get id() {
		return "bool";
	}

	static serialize(client, _, val) {
		return "" + val;
	}

	static deserialize(client, _, val) {
		if (val.toLowerCase() == "null") val = "false";
		return val == "false" ? false : true;
	}

	static render(client, msg, val) {
		return val.toString() == "true" ? "Enabled" : "Disabled";
	}

	static validate(client, _, val) {
		if (val.toLowerCase() == "null") val = "false";
		return ["true", "false"].includes(val.toLowerCase());
	}
}