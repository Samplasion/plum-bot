export default class IntType {
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
}