import { compose }     from "redux";
import { connect }     from "react-redux";
import injectSaga      from "@app/utils/injectSaga";

import {
	createGame,
	setUIState,
}                      from "@app/actions";
import selectors       from "@app/selectors";
import LocationHandler from "./LocationHandler";
import saga            from "./saga";
import { SECTION_NAME } from "./constants";

const withRedux = connect(
	function mapStateToProps(state) {
		const propValues = [
			"width",
			"height",
			"playerLimit",
			"keepRatio",
			"widthError",
			"heightError",
			"playerLimitError",
			"location",
		].reduce(
			(values, settingName) => {
				values[settingName] = selectors.ui.getSetting(
					state,
					{
						section: SECTION_NAME,
						settingName,
					}
				);

				return values;
			},
			{}
		);

		const storedLocation = propValues.location;

		delete propValues.location;
		
		return {
			...propValues,
			storedLocation,
		};
	},
	function mapDispatchToProps(dispatch, ) {
		return {
			onCreateGame({
				width,
				height,
				playerLimit,
			}) {
				dispatch(createGame({
					width,
					height,
					playerLimit,
				}));
			},

			onWidthChange({ value, error }) {
				dispatch(
					setUIState({
						section: SECTION_NAME,
						settings: {
							width: value,
							widthError: error,
						},
					})
				);
			},

			onHeightChange({ value, error }) {
				dispatch(
					setUIState({
						section: SECTION_NAME,
						settings: {
							height: value,
							heightError: error,
						},
					})
				);
			},

			onPlayerLimitChange({ value, error }) {
				dispatch(
					setUIState({
						section: SECTION_NAME,
						settings: {
							playerLimit: value,
							playerLimitError: error,
						},
					})
				);
			},

			onToggleKeepRatio({ currentValue }) {
				dispatch(
					setUIState({
						section: SECTION_NAME,
						settings: {
							keepRatio: !currentValue,
						},
					})
				);
			},

			updateSearchString({ searchString }) {
				dispatch(
					setUIState({
						section: SECTION_NAME,
						settings: {
							searchString,
						},
					})
				);
			}
		};
	}
);

const withSaga = injectSaga({ key: "CreateGameContainer", saga });

const CreateGameContainer = compose(
	withSaga,
	withRedux,
)(LocationHandler);

CreateGameContainer.displayName = "CreateGameContainer";

export default CreateGameContainer;
