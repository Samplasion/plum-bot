module.exports = class IntType {
	static get nullValue() {
		return null;
	}

	static get id() {
		return "int";
	}

	static serialize(client, _, val) {
		return "" + val;
	}

	static deserialize(client, _, val) {
		return parseInt(val);
	}

	static render(client, _, values) {
		if (!values) return this.nullValue;

		if (Array.isArray(values)) {
			let array = [];

			for (var value of values) {
				array.push(parseInt(value));
			}

			return array;
		}

		return parseInt(values);
	}

	static validate(client, _, val) {
		return !isNaN(val);
	}

    static webRender(client, guild, val) {
		let n = this.deserialize(client, { guild }, val);
		return n;
    }

    static webInput(_, __, ___, name) { // eslint-disable-line no-unused-vars
        return `<input class="input" id="${name}" name="${name}" type="number">`
    }

    static webSerialize(_, __, val) { // eslint-disable-line no-unused-vars
        return isNaN(val) ? this.nullValue : parseInt(val);
    }
}