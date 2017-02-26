const Users = require('../../models/users');
const findUsers = require('../../middleware/users/findUsers').findUsers;

const findAll = [
    findUsers
];




module.exports = { findAll };