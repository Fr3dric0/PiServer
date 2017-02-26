const express = require('express');
const router = express.Router();
const { requireToken, requireAdmin } = require('../../middleware/auth');

const { findOne } = require('./findOne');
const { findAll } = require('./findAll');
const { register } = require('./register');

/* GET home page. */
router.get('/', requireToken, findOne);
router.get('/all', requireToken, findAll);

router.post('/register', register);


module.exports = router;
