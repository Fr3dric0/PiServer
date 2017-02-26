const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.status(200).json({ title: 'hello' });
});


/////////////////////////////
//      404 API-ERROR      //
/////////////////////////////
router.all('*', (req, res, next) => {
    const err = new Error(`Cannot find route ${req.url}`);
    err.status = 404;
    next(err);
});

module.exports = router;
