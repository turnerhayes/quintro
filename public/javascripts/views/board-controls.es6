import $ from "jquery";
import Backbone from "backbone";

class BoardControlsView extends Backbone.View {
	get events() {
		return {
			'change [name="color"]': '_handleColorPickerChange',
			'click [name="next-color"]': '_handleNextColorButtonClick',
			'change [name="board-width"],[name="board-height"]': '_handleDimensionChange',
			'change [name="number-of-players"]': '_handleNumberOfPlayersChange',
		};
	}

	initialize() {
		var view = this;

		view.$colorPicker = view.$el.find('[name="color"]');

		view.$autoProgressCheckbox = view.$el.find('[name="auto-progress"]');

		view.$heightPicker = view.$el.find('[name="board-height"]');

		view.$widthPicker = view.$el.find('[name="board-width"]');

		view.$colorPicker.trigger('change');

		view.listenTo(window.game.model, 'player-changed', function(data) {
			view.$colorPicker.val(data.currentPlayer);
		});
	}

	_handleColorPickerChange(event) {
		var value = $(event.target).val();

		window.game.boardView.color = value;
	}

	_handleNextColorButtonClick() {
		var view = this;

		var nextIndex = view.$colorPicker.get(0).selectedIndex + 1;

		if (nextIndex >= view.$colorPicker.children('option').not(':disabled').length) {
			nextIndex = 0;
		}

		view.$colorPicker.get(0).selectedIndex = nextIndex;

		view.$colorPicker.trigger('change');
	}

	_handleDimensionChange() {
		var view = this;

		window.game.boardView.dimensions = {
			width: parseInt(view.$widthPicker.val(), 10),
			height: parseInt(view.$heightPicker.val(), 10),
		};
	}

	_handleNumberOfPlayersChange(event) {
		var view = this;

		var numberOfPlayers = parseInt($(event.target).val(), 10);

		view.$colorPicker.children('option').each(
			function(index) {
				$(this).prop('disabled', index >= numberOfPlayers);
			}
		);

		if (view.$colorPicker.find(':selected').prop('disabled')) {
			view.$colorPicker.get(0).selectedIndex = view.$colorPicker
				.children('option').not(':disabled').length - 1;

			view.$colorPicker.trigger('change');
		}
	}
}

export default BoardControlsView;
