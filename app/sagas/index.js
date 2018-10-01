import authenticationSaga from "./authentication";
import gamesSocketSaga from "./games-socket";
import usersSocketSaga from "./users-socket";

export default [
	authenticationSaga,
	gamesSocketSaga,
	usersSocketSaga,
];
