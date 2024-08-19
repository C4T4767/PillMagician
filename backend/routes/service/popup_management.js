const express = require('express');
const router = express.Router();
const connection = require('../../db');
const isAuthenticated = require('../isAuthenticated');

router.get('/', isAuthenticated, (req, res) => {
    res.render('cog_service/popup_management', { layout: 'layouts/main_layout', user: req.session.user });
});

module.exports = router;
