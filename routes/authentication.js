"use strict";

var express              = require('express');
var passport             = require('passport');
var authenticationConfig = require('../config/authentication');

function login(req, res) {
	res.render('login');
}

var router = new express.Router();

router.route('/login')
	.get(
		login
	)
	.post(
		passport.authenticate(
			'local',
			{
				successRedirect: '/',
				failureRedirect: '/login',
				failureMessage: true
			}
		)
	);

router.route('/logout')
	.get(
		function(req, res) {
			req.logout();
			res.redirect('/');
		}
	);

router.route('/auth/fb')
	.get(
		passport.authenticate('facebook', { "scope": authenticationConfig.facebook.scope || [] })
	);

router.route(authenticationConfig.facebook.callbackURL)
	.get(
		passport.authenticate(
			'facebook',
			{
				successRedirect: '/',
				failureRedirect: '/login',
				failureFlash: true,
			}
		)
	);

exports = module.exports = router;
