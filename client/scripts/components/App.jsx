import React          from "react";
import PropTypes      from "prop-types";
import { withRouter } from "react-router";
import TopNavigation  from "project/scripts/components/TopNavigation";
import                     "bootstrap/dist/js/bootstrap.js";
import                     "project/styles/page-layout.less";

class App extends React.Component {
	static propTypes = {
		children: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node
		])
	}

	static defaultProps = {
		children: []
	}

	render() {
		return (
			<section className="page-layout__main-container">
				<header>
					<TopNavigation
					/>
				</header>
				<article className="page-layout__main-content">
					{this.props.children}
				</article>
			</section>
		);
	}
}

export default withRouter(App);
