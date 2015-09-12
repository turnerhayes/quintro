import $ from "jquery";
import initHandlebars from "./init/es6/handlebars";
import QuintroGameView from "./views/game";
import BoardControlsView from "./views/board-controls";
import LoginView from "./views/login";
import SocketClient from './socket-client';

initHandlebars();

var loginSectionEl = document.querySelector('.login-section');

if (loginSectionEl) {
	window.loginView = new LoginView({
		el: loginSectionEl
	});
}

window.game = new QuintroGameView({
	el: document.querySelector('.board-container'),
	$boardEl: $('.board'),
	$turnIndicatorEl: $('.turn-indicator'),
	players: 3,
})/*.render()*/;

window.boardControls = new BoardControlsView({
	el: document.querySelector('.board-controls')
});
