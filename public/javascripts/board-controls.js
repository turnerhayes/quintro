(function($) {
	"use strict";

	var $controls = $('.board-controls');

	var $numberOfPlayersPicker = $controls.find('[name="number-of-players"]');

	var $colorPicker = $controls.find('[name="color"]');

	var $autoProgressCheckbox = $controls.find('[name="auto-progress"]');

	var $widthPicker = $controls.find('[name="board-width"]');
	var $heightPicker = $controls.find('[name="board-height"]');

	$controls.on('change.board-controls', '[name="color"]', function() {
		var value = $(this).val();

		window.board.color = value;
	});

	$controls.on('click.board-controls', '[name="next-color"]', function() {
		var nextIndex = $colorPicker.get(0).selectedIndex + 1;

		if (nextIndex >= $colorPicker.children('option').not(':disabled').length) {
			nextIndex = 0;
		}

		$colorPicker.get(0).selectedIndex = nextIndex;

		$colorPicker.trigger('change');
	});

	$controls.on('change.board-controls', '[name="board-width"], [name="board-height"]', function() {
		window.board.dimensions = {
			width: parseInt($widthPicker.val(), 10),
			height: parseInt($heightPicker.val(), 10)
		};
	});

	$controls.on('change.board-controls', '[name="number-of-players"]', function() {
		var numberOfPlayers = parseInt($numberOfPlayersPicker.val(), 10);

		$colorPicker.children('option').each(
			function(index) {
				$(this).prop('disabled', index >= numberOfPlayers);
			}
		);

		if ($colorPicker.find(':selected').prop('disabled')) {
			$colorPicker.get(0).selectedIndex = $colorPicker.children('option').not(':disabled').length - 1;

			$colorPicker.trigger('change');
		}
	});

	$(document).on('marble-placed.board-controls', function() {
		if ($autoProgressCheckbox.prop('checked')) {
			$controls.find('[name="next-color"]').click();
		}
	});

	window.board.color = $colorPicker.val();
}(jQuery));