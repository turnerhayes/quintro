import { intlShape } from "react-intl";

let intl;

export default function IntlContextExposer(props, context) {
	intl = context.intl;

	return props.children;
}

IntlContextExposer.contextTypes = {
	intl: intlShape,
};

export function formatMessage(...args) {
	return intl.formatMessage(...args);
}
