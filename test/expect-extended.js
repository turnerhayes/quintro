const expect = require("expect");
const  {
	is,
	fromJS
}            = require("immutable");

expect.extend({
	toEqualImmutable(expected) {
		expect.assert(
			is(expected, this.actual),
			"Expected %s to be equivalent to %s",
			JSON.stringify(this.actual),
			JSON.stringify(expected)
		);

		return this;
	},

	toBeEmpty(message) {
		expect.assert(fromJS(this.actual).size === 0,
			(message || "Expected %s to be empty"),
			JSON.stringify(this.actual)
		);

		return this;
	},

	toMatchOrderInsensitive(expected) {
		const unexpected = this.actual.subtract(expected);

		expect(unexpected).toBeEmpty("Found items that were not expected: %s");

		const missing = expected.subtract(this.actual);

		expect(missing).toBeEmpty("Did not find expected items: %s");

		return this;
	}
});

exports = module.exports = expect;
