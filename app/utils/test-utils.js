import React from "react";
import { IntlProvider } from "react-intl";
import configureStore from "redux-mock-store";

import { translationMessages } from "@app/i18n";

const intlProvider = new IntlProvider({ locale: "en", messages: translationMessages.en }, {});
export const { intl } = intlProvider.getChildContext();

export const formatMessage = intl.formatMessage.bind(intl);

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

const _mockStore = configureStore();

export const mockStore = (...args) => {
	const store = _mockStore(...args);

	store.injectedReducers = {};
	store.injectedSagas = {};

	store.runSaga = () => {};

	return store;
};
