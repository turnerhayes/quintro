import React from "react";
import PropTypes from "prop-types";
import qs from "qs";

import CreateGame from "@app/components/CreateGame";

/**
* Sets the component state from the location's query string, if it is not empty.
*
* @function
*
* @return {void}
*/
const getPropsFromQuery = function getStateFromQuery(searchString) {
	if (!searchString) {
		return {};
	}
	
	const query = qs.parse(searchString.replace(/^\?/, ""));
	
	// if any are NaN, let it use the defaults
	if (Number.isNaN(Number(query.width))) {
		delete query.width;
	}
	
	if (Number.isNaN(Number(query.height))) {
		delete query.height;
	}
	
	if (Number.isNaN(Number(query.playerLimit))) {
		delete query.playerLimit;
	}
	
	return query;
};

class CreateGameLocationHandler extends React.PureComponent {
	/**
	* 
	* @prop {object} location - route location, as passed by `react-router-dom`
	*
	* @see {@link https://reacttraining.com/react-router/web/api/location|React Router docs}
	*	for the shape of the `location` object
	*/
	static propTypes = {
		location: PropTypes.object,
		updateSearchString: PropTypes.func.isRequired,
		searchString: PropTypes.string,
		...CreateGame.propTypes,
	}
	
	componentDidMount() {
		this.fireChangeHandlersForSearchString();
	}
	
	componentDidUpdate() {
		this.fireChangeHandlersForSearchString();
	}
	
	fireChangeHandlersForSearchString() {
		let searchString = this.props.searchString;
		
		if (this.props.location.search !== this.props.searchString) {
			searchString = this.props.location.search;
			this.props.updateSearchString({ searchString });
			
			const {
				width,
				height,
				playerLimit,
			} = getPropsFromQuery(searchString);
			
			if (width && width !== this.props.width) {
				this.props.onWidthChange({ value: width, error: null });
			}
			
			if (height && height !== this.props.height) {
				this.props.onHeightChange({ value: height, error: null });
			}
			
			if (playerLimit && playerLimit !== this.props.playerLimit) {
				this.props.onPlayerLimitChange({ value: playerLimit, error: null });
			}
		}
	}
	
	
	render() {
		const {
			// eslint-disable-next-line no-unused-vars
			location,
			// eslint-disable-next-line no-unused-vars
			updateSearchString,
			// eslint-disable-next-line no-unused-vars
			searchString,
			...props
		} = this.props;
		
		return (
			<CreateGame
				{...props}
			/>
		);
	}
}
	
export default CreateGameLocationHandler;
	