const express = require('express');
const router = express.Router();

const imdb = require('imdb-api');

/**
 * Check query param 's' or 'search' exists
 * */
router.get('/', (req, res, next) => {
    const { s, search } = req.query;

    if (search) {
        req.search = { s: search };
    }
    if (s) {
        req.search = { s };
    }

    if (!req.search) {
        const err = new Error('Missing "search" or "s" query-param');
        err.status = 400;
        return next(err);
    }

    next();

}, (req, res, next) => {
    imdb.get(req.search.s).then((data) => {
        res.status(200).json(data);
    })
});

module.exports = router;
