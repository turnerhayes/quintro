"use strict";

var express  = require('express');
var passport = require('passport');
var config   = require('../lib/utils/config-manager');

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
		passport.authenticate('facebook', { "scope": config.authentication.facebook.scope || [] })
	);

router.route(config.authentication.facebook.callbackURL)
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
