import React from "react";
import { IntlProvider } from "react-intl";
import { translationMessages } from "@app/i18n";

export function unwrapComponent(component) {
	if (component.WrappedComponent) {
		return unwrapComponent(component.WrappedComponent);
	}

	if (component.Naked) {
		return unwrapComponent(component.Naked);
	}

	return component;
}

export const wrapWithIntlProvider = (Component) => {
	const WrapperComponent = ({...props}) => {
		return (
			<IntlProvider
				locale="en"
				messages={translationMessages.en}
			>
				<Component
					{...props}
				/>
			</IntlProvider>
		);
	};

	WrapperComponent.getDisplayName = (name) => `wrapWithIntlProvider(${name})`;

	WrapperComponent.WrappedComponent = Component;

	return WrapperComponent;
};
