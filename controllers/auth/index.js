const express = require('express');
const router = express.Router();
const jwt = require('../../middleware/token/');
const Users = require('../../models/users');

router.post('/token', (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        const err = new Error('Missing login fields "email" or "password"');
        err.status = 400;
        return next(err);
    }

    Users.authenticate(email, password)
        .then((user) => {
            let token = jwt.generate({uid: user._id});
            return res.status(200).json({ success: true, token });
        })
        .catch((err) => {
            if (err.status != 400 || err.status != 403 || err.status != 401) {
                console.error(err);
            }

            // Re initialize the error object, with public-friendly error messages
            err = new Error('Not authenticated');
            err.status = 403;
            next(err);
        });
});

module.exports = router;