import React from "react";

class Login extends React.Component {
	render() {
		return (
			<section className="login-section">
				<ul className="nav nav-tabs" data-tabs="tabs">
					<li className="active" role="presentation">
						<a href="#social-login" role="tab" data-toggle="tab">Facebook</a>
					</li>
					<li role="presentation">
						<a href="#credentials-login" role="tab" data-toggle="tab">Username/Password</a>
					</li>
				</ul>
				<div className="tab-content">
					<div className="sso-buttons tab-pane active" id="social-login" role="tabpanel">
						<div className="panel panel-default">
							<div className="panel-body">
								<a href="/auth/fb" className="btn btn-default login-button facebook">Login with Facebook</a>
								<a href="/auth/google" className="btn btn-default login-button google">Login with Google</a>
							</div>
						</div>
					</div>
					<div id="credentials-login" className="tab-pane" role="tabpanel">
						<form className="login-form" action="/login" method="post">
							<fieldset className="form-field-container input-group">
								
							</fieldset>
						</form>
					</div>
				</div>
			</section>
		);
	}
}

export default Login;
