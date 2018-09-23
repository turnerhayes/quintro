import { connect } from "react-redux";

import Sandbox from "@app/components/Sandbox";

function mapStateToProps(/* state, ownProps */) {
	return {};
}

const SandboxContainer = connect(mapStateToProps)(Sandbox);

export default SandboxContainer;
