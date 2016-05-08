/**
 * Created by Acer on 16.04.2016.
 */
var express = require('express');
var fs = require('fs');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectID = require("mongodb").ObjectID;
var request = require('request');
var mongoUrl = "mongodb://localhost:27017/PiMediaServer";
router.get("/:user", function (req, res) {
    res.render("user", {
        title: "PiServer",
        user: req.user
    });
});
module.exports = router;
//# sourceMappingURL=user.js.map