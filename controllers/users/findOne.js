const Users = require('../../models/users');
const validateUid = require('../../middleware/auth/uidValidator').validateUid;
const findUser = require('../../middleware/users/findUser').findUser;

const findOne = [
    validateUid,
    findUser,
    returnUser
];

function returnUser(req, res, next) {
    const { user } = req.users;
    const { _id, firstName, lastName, email, accessRights, starredVideos, created} = user;
    res.status(200).json({
        _id,
        firstName,
        lastName,
        email,
        accessRights,
        starredVideos,
        created
    });
}

module.exports = { findOne };