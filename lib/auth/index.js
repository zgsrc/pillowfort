exports.facebook = require("./facebook");

exports.google = require("./google");

exports.login = require("./login");

exports.redirect = function(url) {
    return function(req, res, next) {
        res.redirect(url);
    };
};

exports.router = require("./router");