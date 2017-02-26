const Users = require('../../models/users');

const findUser = [
    validateInput,
    getUser
];

function validateInput(req, res, next) {
    const { email, firstName, lastName, uid } = req.body;
    const query = {};

    if (req.decoded && req.decoded.uid) {
        query._id = req.decoded.uid;
    }

    if (!query._id) { // If _id exists. The other fields can be ignored
        query.email = email;
        query.firstName = firstName;
        query.lastName = lastName;

        if (uid) {
            query._id = uid;
        }
    }

    if (!req.users) {
        req.users = { query };
    } else {
        res.users.query = query;
    }

    next();
}

function getUser(req, res, next) {
    const { query } = req.users;
    const { filter = {}} = req.body;

    Users.findOne(query, filter)
        .then((user) => {
            if (!user) {
                const err = new Error('Cannot find user with current id');
                err.status = 500;
                throw err; // Let catch() handle 'err'
            }

            req.users.user = user;
            next();
        })
        .catch(err => next(err));
}


module.exports = { findUser, validateInput };