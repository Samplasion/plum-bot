export default class StringType {
	static get nullValue() {
		return "";
	}

	static get id() {
		return "string";
	}

	static serialize(client, _, values) {
		if (!values) return "";

		if (Array.isArray(values)) {
			let array = [];

			for (var value of values) {
				array.push("" + value);
			}

			return array;
		}

		return "" + values;
	}

	static deserialize(client, _, values) {
		if (!values) return "";

		if (Array.isArray(values)) {
			let array = [];

			for (var value of values) {
				array.push("" + value);
			}

			return array;
		}

		return "" + values;
	}

	static render(client, _, values) {
		if (!values) return "";

		if (Array.isArray(values)) {
			let array = [];

			for (var value of values) {
				array.push("" + value);
			}

			return array;
		}

		return "" + values;
	}

	static validate(client, _, values) {
		if (!values) return false;

		if (Array.isArray(values)) {
			for (var value of values) {
				if (typeof value !== "string")
					return false;
			}

			return true;
		}

		return typeof values == "string";
	}
}