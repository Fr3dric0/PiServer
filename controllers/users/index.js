const express = require('express');
const router = express.Router();
const { requireToken, requireAdmin } = require('../../middleware/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.status(200).json({title: 'hello'});
});

module.exports = router;
