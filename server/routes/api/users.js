"use strict";

const express                  = require("express");
const rfr                      = require("rfr");
const { mustAuthenticate }     = rfr("server/routes/utils");
const UsersStore               = rfr("server/persistence/stores/user");
const AccessForbiddenException = rfr("server/persistence/exceptions/access-forbidden");

const router = express.Router();

router.route("/:userID")
	.patch(
		mustAuthenticate("You must be logged in as the user to edit their information"),
		(req, res, next) => {
			const userID = Number(req.params.userID);

			if (req.user.id !== userID) {
				next(new AccessForbiddenException("You do not have permissions to edit this user's information"));
			}
			const updates = req.body;

			UsersStore.updateUser({
				userID,
				updates
			}).then(
				() => UsersStore.findByID(userID)
			).then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

router.route("/:userID/subscriptions")
	.get(
		mustAuthenticate("You must be logged in to see a user's issue subscriptions"),
		(req, res, next) => {
			const userID = Number(req.params.userID);
			const includeDeleted = !!req.query.include_deleted;

			UsersStore.getIssueSubscriptions({
				userID,
				includeDeleted
			}).then(
				res.json.bind(res)
			).catch(ex => next(ex));
		}
	);

exports = module.exports = router;
