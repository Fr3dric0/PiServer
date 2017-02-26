const express = require('express');
const router = express.Router();

const { requireToken } = require('../../middleware/auth');

const { findOne } = require('./findOne');
const { findAll } = require('./findAll');

router.get('/', requireToken, findAll);
router.get('/:vidId', requireToken, findOne);

module.exports = router;
