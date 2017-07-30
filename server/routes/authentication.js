"use strict";

const express  = require("express");
const passport = require("passport");
const rfr      = require("rfr");
const Config   = rfr("server/lib/config");

const router = express.Router();

router.route("/auth/fb")
	.get(
		(req, res, next) => { req.session.redirectTo = req.query.redirectTo; next(); },
		passport.authenticate("facebook", { scope: Config.auth.facebook.scope || [] })
	);

router.route(Config.auth.facebook.callbackURL)
	.get(
		(req, res, next) => {
			passport.authenticate(
				"facebook",
				{
					successRedirect: req.session.redirectTo || "/",
					failureRedirect: req.session.redirectTo || "/",
					failureFlash: true,
				}
			)(req, res, next);

			delete req.session.redirectTo;
		}
	);

router.route("/logout")
	.get(
		(req, res) => {
			req.logout();
			res.redirect(req.query.redirectTo || "/");
		}
	);

module.exports = router;
