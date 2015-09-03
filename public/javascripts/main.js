/* jshint node: true */
"use strict";

var QuintroGame = require('./game/game.js');
var $           = require('../bower_components/jquery/dist/jquery');

window.game = new QuintroGame({
	$el: $('.board-container'),
	$boardEl: $('.board'),
	players: 3
});
