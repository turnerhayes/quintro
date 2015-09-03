import $ from "jquery";
import initHandlebars from "./init/es6/handlebars";
import QuintroGameView from "./views/game";
import BoardControlsView from "./views/board-controls";

initHandlebars();

window.game = new QuintroGameView({
	el: document.querySelector('.board-container'),
	$boardEl: $('.board'),
	$turnIndicatorEl: $('.turn-indicator'),
	players: 3,
})/*.render()*/;

window.boardControls = new BoardControlsView({
	el: document.querySelector('.board-controls')
});
