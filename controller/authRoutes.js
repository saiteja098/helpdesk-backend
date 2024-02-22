const express = require('express');
const router = express.Router();
const authService = require('../services/authentication');

router.route('/login')
    .post(authService.login)

router.route('/signUp')
    .post(authService.signUp)

router.route('/refresh')
    .get(authService.refresh)

router.route('/logout')
    .post(authService.logout)


module.exports = router;