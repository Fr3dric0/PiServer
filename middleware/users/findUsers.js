const Users = require('../../models/users');
const { validateInput } = require('./findUser');

const findUsers = [
    validateInput,
    getUsers
];

function getUsers(req, res, next) {
    const { query = {} } = req.users;
    const { filter = {} } = req.body;

    Users.find(query, filter)
        .then((users) => {
            req.users.users = users;
            next();
        })
        .catch( err => next(err));
}

module.exports = { findUsers };