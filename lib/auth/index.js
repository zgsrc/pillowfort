exports.OAuth2 = require("./oauth2");

exports.social = { };

require("fs").readdirSync(__dirname + "/social").filter(/.*js/).forEach(file => {
    exports.social[file.to(-3)] = require(__dirname + "/social/" + file);
});

exports.login = require("./login");

exports.redirect = function(url) {
    return function(req, res, next) {
        res.redirect(url);
    };
};
