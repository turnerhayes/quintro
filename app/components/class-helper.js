import BEMHelper from "react-bem-helper";

const helper = BEMHelper.withDefaults({
	prefix: "qc-"
});

export default function createHelper(name) {
	return new helper({
		name,
	});
}
