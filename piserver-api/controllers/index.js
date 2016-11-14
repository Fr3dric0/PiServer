var express = require('express');
var router = express.Router();

/**
 * @Controller      GET /videos
 * */
router.get('/', function (req, res, next) {
    res.json({ title: 'Hello world' })
});

module.exports = router;
