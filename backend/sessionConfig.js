const express = require('express');
const session = require('express-session');

const router = express.Router();

router.use(
    session({
      secret: 'secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {secure: false, maxAge: 1000 * 60 * 60 * 24},
    }),
  );

module.exports = router;