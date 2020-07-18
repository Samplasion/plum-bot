module.exports = class BoolType {
	static get nullValue() {
		return "false";
	}

	static get id() {
		return "bool";
	}

	static serialize(client, _, val) {
        console.log(val);
		return "" + val;
	}

	static deserialize(client, _, val) {
		if (("" + val).toLowerCase() == "null") val = "false";
        console.log("des", val);
		return "" + val == "true" ? true : false;
	}

	static render(client, msg, val) {
		return val.toString() == "true" ? "Enabled" : "Disabled";
	}

	static validate(client, _, val) {
		if (val.toLowerCase() == "null") val = "false";
		return ["true", "false"].includes(val.toLowerCase());
	}

    static webRender(client, guild, val) {
        console.log("render", val, typeof val);
        let checked = val.toString() == "true" ? ":ballot_box_with_check:" : ":negative_squared_cross_mark:";
        let endis = val.toString() == "true" ? "En" : "Dis";
        return `${checked} ${endis}abled`;
    }

    static webInput(client, guild, val, name) {
        return `<input id="${name}" name="${name}" type="checkbox" ${val.toString() == "true" ? "checked" : ""}>`
    }

    static webSerialize(client, guild, val) {
        console.log("serial", val);
        if (val == "null" || !val)
            return this.nullValue;
        return val ? val == "on" : this.nullValue;
    }
}