const Users = require('../../models/users');
const jwt = require('../../middleware/token/');

//const { findUsers } = require('../../middleware/users');

const register = [
    validateFields,
    checkDuplicates,
    createUser,
    createToken,
    returnData
];

function validateFields (req, res, next) {
    const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    const user = {};

    for (let field of fields) {
        if (!req.body[field]) {
            const err = new Error(`[Registration Error] Missing field ${field} in registration form`);
            err.status = 400;
            return next(err);
        }

        user[field] = req.body[field];
    }

    req.user = user;
    next();
}

function checkDuplicates (req, res, next) {
    const { user } = req;

    Users.findOne({email: user.email})
        .then((data) => {
            // If user exists, we have a duplicate
            if (data) {
                const err = new Error(`[Registration Error] User: ${user.email}, already exists!`);
                err.status = 400;
                return next(err);
            }

            next();
        })
        .catch( err => next(err));
}

function createUser (req, res, next) {
    const { user } = req;

    Users.create(user)
        .then((data) => {
            req.user = data; // Replace data
            next();
        })
        .catch( err => next(err));
}

function createToken (req, res, next) {
    const { user } = req;

    req.token = jwt.generate({uid: user._id});
    next();
}

function returnData (req, res, next) {
    const { user, token } = req;

    res.status(201).json({
        token,
        email: user.email
    });
}



module.exports = { register };