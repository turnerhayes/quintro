"use strict";

const express  = require("express");
const passport = require("passport");
const rfr      = require("rfr");
const Config   = rfr("server/lib/config");

const router = express.Router();

router.route("/auth/fb")
	.get(
		passport.authenticate("facebook", { scope: Config.auth.facebook.scope || [] })
	);

router.route(Config.auth.facebook.callbackURL)
	.get(
		passport.authenticate(
			"facebook",
			{
				successRedirect: "/",
				failureRedirect: "/",
				failureFlash: true,
			}
		)
	);

router.route("/logout")
	.get(
		(req, res) => {
			req.logout();
			res.redirect("/");
		}
	);

module.exports = router;
