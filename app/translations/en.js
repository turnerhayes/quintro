export default {
	"quintro.general.actions.logIn": "Log in",
	"quintro.general.actions.logOut": "Log out",
	"quintro.general.form.isRequired": "This field is required",
	"quintro.components.GameFormControls.DimensionInput.widthLabel": "Width",
	"quintro.components.GameFormControls.DimensionInput.heightLabel": "Height",
	"quintro.components.GameFormControls.DimensionInput.widthTooSmallError": "{value} is less than the minimum width ({min})",
	"quintro.components.GameFormControls.DimensionInput.widthTooLargeError": "{value} is greater than the maximum width ({max})",
	"quintro.components.GameFormControls.DimensionInput.heightInvalidError": "{value} is not a valid value for the height",
	"quintro.components.GameFormControls.DimensionInput.heightTooSmallError": "{value} is less than the minimum height ({min})",
	"quintro.components.GameFormControls.DimensionInput.heightTooLargeError": "{value} is greater than the maximum height ({max})",
	"quintro.components.GameFormControls.DimensionInput.lockKeepRatio": "Lock ratio",
	"quintro.components.GameFormControls.DimensionInput.unlockKeepRatio": "Unlock ratio",
	"quintro.components.GameFormControls.PlayerLimitInput.label": "Number of players",
	"quintro.components.GameFormControls.PlayerLimitInput.invalidError": "{value} is not a valid value for the player limit",
	"quintro.components.GameFormControls.PlayerLimitInput.tooSmallError": "{value} is less than the minimum number of players ({min})",
	"quintro.components.GameFormControls.PlayerLimitInput.tooLargeError": "{value} is greater than the maximum number of players ({max})",
	"quintro.components.TopNavigation.homeLink": "Home",
	"quintro.components.TopNavigation.findGameLink": "Find a Game",
	"quintro.components.TopNavigation.howToPlayLink": "How to Play",
	"quintro.components.TopNavigation.startGameLink": "Start a Game",
	"quintro.components.AccountDialog.logInWithAction": "Log in with {provider}",
	"quintro.components.GameJoinDialog.watchGameButtonLabel": "I want to watch this game",
	"quintro.components.GameJoinDialog.joinButtonLabel": "Join",
	"quintro.components.GameJoinDialog.cancelButtonLabel": "Cancel",
	"quintro.components.GameJoinDialog.color": "Color",
	"quintro.components.GameJoinDialog.joinThisGamePrompt": "Join this game",
	"quintro.components.GameJoinDialog.gameIsFullCannotJoinReason": "Sorry, this game is full",
	"quintro.components.GameJoinDialog.gameIsInProgressCannotJoinReason": "Sorry, this game is already in progress",
	"quintro.components.GameJoinDialog.cannotJoinActions": "{findGameLink} or {createGameLink}",
	"quintro.components.GameJoinDialog.findGameLinkText": "Find another game",
	"quintro.components.GameJoinDialog.createGameLinkText": "create your own!",
	"quintro.components.CreateGame.header": "Create a Game",
	"quintro.components.CreateGame.dimensionsLabel": "Dimensions",
	"quintro.components.CreateGame.submitButtonLabel": "Create",
	"quintro.components.PlayGame.watchersWithYouSummary": `You {watcherCount, plural,
		=0 {}
		one {and 1 other person}
		other {and {watcherCount} other people}
	} are watching this game.`,
	"quintro.components.PlayGame.watchersWithoutYouSummary": `{watcherCount, plural,
		one {1 person is}
		other {{watcherCount} people are}
	} watching this game.`,
	"quintro.components.PlayGame.loadingErrorMessage": "Error loading the game",
	"quintro.components.PlayGame.WinnerBanner.winMessage": "{winnerColor} wins!",
	"quintro.containers.PlayGame.saga.notificationTitle": "Quintro",
	"quintro.containers.PlayGame.saga.notificationMessage": "It's your turn!",
	"quintro.components.PlayerIndicators.youIndicator": "This is you",
	"quintro.components.PlayerIndicators.presentNamedPlayerIndicator": "{playerName}",
	"quintro.components.PlayerIndicators.absentNamedPlayerIndicator": "{playerName} is absent",
	"quintro.components.PlayerIndicators.presentAnonymousPlayerIndicator": "Player {playerColor}",
	"quintro.components.PlayerIndicators.absentAnonymousPlayerIndicator": "Player {playerColor} is absent",
	"quintro.components.PlayerIndicators.availableSlotIndicator": "This spot is open for another player",
	"quintro.components.FindGame.header": "Find a Game",
	"quintro.components.FindGame.searchingText": "Searching for open games, please wait",
	"quintro.components.FindGame.cancelSearchLabel": "Stop searching",
	"quintro.components.FindGame.playerLimitLabel": "Number of players",
	"quintro.components.FindGame.playerLimitDetails": "Leave blank if you don't care how many players the game has",
	"quintro.components.FindGame.submitButtonLabel": "Find",
	"quintro.components.UserGamesList.title": "My Games",
	"quintro.components.UserGamesList.badgeTooltip": `Game has {playerCount} {playerCount, plural,
		one {player}
		other {players}
	}`,
	"quintro.components.UserGamesList.inProgressTab": "In Progress",
	"quintro.components.UserGamesList.finishedTab": "Finished Games",
	"quintro.components.UserGamesList.notStartedListItem": "Game has not started yet",
	"quintro.components.UserGamesList.waitingForYouListItem": "It's your turn!",
	"quintro.components.UserGamesList.noGamesActionsMessage": "You are not a part of any games. {findGameLink} or {createGameLink}!",
	"quintro.components.UserGamesList.noGamesActionsFindGameLinkText": "Find one to join",
	"quintro.components.UserGamesList.noGamesActionsCreateGameLinkText": "start your own",
	"quintro.components.PlayerInfoPopup.displayNameInputLabel": "My name",
	"quintro.components.PlayerInfoPopup.displayNameInputSubmitButtonTitle": "Change",
	"quintro.components.PlayerInfoPopup.displayNameInputCancelButtonTitle": "Cancel",
	"quintro.components.PlayerInfoPopup.profileLink": "Profile",
	"quintro.components.PlayerInfoPopup.showFormButtonTitle": "Change display name",
	"quintro.components.PlayerInfoPopup.anonymousUserTitle": "Anonymous User",
	"quintro.components.AddPlayerButton.buttonTitle": "Add Player",
	"quintro.components.QuickSettingsDialog.dialogTitle": "Quick Settings",
	"quintro.components.QuickSettingsDialog.notificationsSettingLabel": "Enable Browser Notifications",
	"quintro.components.QuickSettingsDialog.soundEffectsSettingLabel": "Enable Sound Effects",
	"quintro.components.QuickSettingsDialog.notificationsSettingName": "Notifications",
	"quintro.components.QuickSettingsDialog.soundEffectsSettingName": "Sound Effects",
	"quintro.components.HowToPlay.header": "How to Play Quintro",
	"quintro.components.HowToPlay.introSectionText": "Quintro is a simple game played with marbles on a square board divided into a grid. The goal is to get five or more marbles of your color in a row before any other player.",
	"quintro.components.HowToPlay.turnsSectionHeader": "Turns",
	"quintro.components.HowToPlay.turnsSectionText": "Players take turns placing a single marble of their color on any unoccupied square on the board. Play order is determined at the start of the game and remains the same throughout the game.",
	"quintro.components.HowToPlay.winningSectionHeader": "Winning",
	"quintro.components.HowToPlay.winningSectionText": "Any line of five or more marbles of your color will cause you to win and the game to end. Lines can be horizontal, vertical, or diagonal. It is possible to have multiple \"quintros\" at once, if the last marble placed would complete multiple lines at once.",
	"quintro.components.HowToPlay.figureCaption": "The last marble placed (circled in red) completed two diagonal quintros",
};
