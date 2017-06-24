"use strict";

const express                  = require("express");
const bodyParser               = require("body-parser");
const rfr                      = require("rfr");
const { mustAuthenticate }     = rfr("server/routes/utils");
const UsersStore               = rfr("server/persistence/stores/user");
const AccessForbiddenException = rfr("server/persistence/exceptions/access-forbidden");

const router = express.Router();

router.route("/:userID")
	.patch(
		mustAuthenticate("You must be logged in as the user to edit their information"),
		bodyParser.urlencoded({
			extended: true,
			type: "application/x-www-form-urlencoded"
		}),
		bodyParser.json({ type: "application/json" }),
		(req, res, next) => {
			const userID = req.params.userID;

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

exports = module.exports = router;
