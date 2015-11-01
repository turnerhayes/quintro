"use strict";

var expect          = require('expect.js');
var mongoose        = require('mongoose');
var GameModel       = require('../lib/persistence/models/game');
var MongoTestConfig = require('./config/mongo');

console.log('MongoTestConfig: ', MongoTestConfig);
mongoose.set('debug', true);
mongoose.connect(MongoTestConfig.url);

function _close(cb) {
	mongoose.connection.close(cb);
}

var addedGames = [];

describe("GameModel", function() {
	describe("set winner", function() {
		it(
			"should not save when `winner` is a color that is not in the game",
			function(done) {
				var model = new GameModel({
					short_id: 'TEST_GAME_' + Date.now(),
					board: {
						height: 10,
						width: 10
					},
					winner: 'green',
					players: [
						{
							color: 'blue'
						},
						{
							color: 'black'
						},
						{
							color: 'red'
						}
					]
				});

				addedGames.push(model.short_id);

				model.save().then(
					function() {
						done(new Error('Game saved even with an invalid `winner` value'));
					},
					function(err) {
						expect(err.errors).to.have.key('winner');
						expect(err.errors.winner.name).to.be('ValidatorError');
						done();
					}
				).then(
					undefined,
					// Catch expect failures above
					function(err) {
						done(err);
					}
				);
			}
		);

		it(
			"should save when `winner` is a color that is in the game",
			function(done) {
				var model = new GameModel({
					short_id: 'TEST_GAME_' + Date.now(),
					board: {
						height: 10,
						width: 10
					},
					winner: 'red',
					players: [
						{
							color: 'blue'
						},
						{
							color: 'black'
						},
						{
							color: 'red'
						}
					]
				});

				addedGames.push(model.short_id);

				model.save().then(
					function(game) {
						expect(game.winner).to.be('red');
						expect(game.is_over).to.be(true);
						done();
					},
					function(err) {
						done(err);
					}
				).then(
					undefined,
					// Catch expect failures above
					function(err) {
						done(err);
					}
				);
			}
		);
	});


	after(function(done) {
		// Clean up the database after ourselves
		GameModel.remove({short_id: {"$in": addedGames}}).then(
			function() {
				_close(done);
			},
			function() {
				_close(done);
			}
		);
	});
});
