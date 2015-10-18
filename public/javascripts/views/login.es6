import $        from "jquery";
import Backbone from "backbone";

var _events = {
	'click.login-view .login-button': 'doLogin',
};

class LoginView extends Backbone.View {
	get events() {
		return _events;
	}

	initialize() {
		var view = this;

		super.initialize.apply(view, arguments);
	}

	doLogin(event) {
		var $target = $(event.target);

		if ($target.hasClass('facebook')) {
			document.location.href = '/auth/fb';
		}
	}
}

export default LoginView;
