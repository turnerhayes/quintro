"use strict";

const express                  = require("express");
const bodyParsers              = require("./body-parsers");
const rfr                      = require("rfr");
const {
	prepareUserForFrontend
}                              = rfr("server/routes/utils");
const UsersStore               = rfr("server/persistence/stores/user");
const AccessForbiddenException = rfr("server/persistence/exceptions/access-forbidden");

const router = express.Router();

router.route("/:userID")
	.patch(
		...bodyParsers,
		(req, res, next) => {
			const userID = req.params.userID;
			const updates = req.body;

			if (req.user && req.user.id !== userID) {
				next(new AccessForbiddenException("You do not have permissions to edit this user's information"));
			}

			return UsersStore.findByID(userID).then(
				(user) => {
					if (user.isAnonymous && req.session.id !== user.sessionID) {
						next(new AccessForbiddenException("You do not have permissions to edit this user's information"));
						return;
					}

					return UsersStore.updateUser({ userID, updates }).then(
						(user) => res.json(prepareUserForFrontend({ user, request: this.req }))
					);
				}
			).catch(next);
		}
	);

router.route("")
	.get(
		(req, res, next) => {
			const ids = (req.query.ids || "").split(",");

			return UsersStore.findByIDs({
				ids
			}).then(
				(users) => res.json(users.map((user) => prepareUserForFrontend({ user, request: this.req })))
			).catch(next);
		}
	);

exports = module.exports = router;
