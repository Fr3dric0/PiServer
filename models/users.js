/**
 * @author: Fredrik Førde Lindhagen <fred.lindh96@gmail.com>
 * @created: 17.11.2016.
 *
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const Bcrypt = require('bcryptjs');
const HASH_ROUNDS = 12;

const Users = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, trim: true },
    accessRights: { type: String, default: 'user', enum: ['user', 'admin', 'owner'] },
    starredVideos: [{ type: Object }],
    created: { type: Date, default: Date.now() }
});

Users.statics.authenticate = function(email, pwd) {
    const self = this; // Used to access Users-methods
    return new Promise((resolve, reject) => {
        self.findOne({ email }, (err, user) => {
            if (err) {
                return reject(err);
            }
            if (!user) {
                const err = new Error('Could not find user');
                err.status = 400;
                return reject(err)
            }

            let { password, _id, email, accessRights, firstName, lastName} = user;

            Bcrypt.compare(pwd, password, (comprErr, result) => {
                if (comprErr) { return reject(comprErr); }

                if (!result) {
                    const err = new Error('Password not authenticated');
                    err.status = 403;
                    return reject(err);
                }

                // Specify each component to return.
                // (Prevent unintentional hash leaks)
                return resolve({
                    _id,
                    email,
                    accessRights,
                    firstName,
                    lastName
                });
            });
        });
    });
};


Users.statics.generateHash = function(pwd) {
    return new Promise((resolve, reject) => {
        Bcrypt.hash(pwd, HASH_ROUNDS, (err, hash) => {
            if (err) {
                return reject(err);
            }

            resolve(hash);
        });
    });
};


Users.pre('save', function(next) {
    let self = this;

    if (self.password.length < 8) {
        let err = new Error('Password length is to short (min=8)');
        err.status = 400;
        return next(err);
    }

    Bcrypt.hash(self.password, HASH_ROUNDS, function(hashErr, hash) {
        if (hashErr) {
            return next(err);
        }

        self.password = hash;
        next();
    });
});

module.exports = mongoose.model('Users', Users);