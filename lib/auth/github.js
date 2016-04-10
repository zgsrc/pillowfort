require("sugar");

var https = require("https");

function redirectUrl(appId, callbackUrl, permissions, state) {
    var url = `https://github.com/login/oauth/authorize` +
        `?client_id=${ appId }` +
        `&response_type=code` +
        `&redirect_uri=${ callbackUrl }` +
        (permissions ? `&scope=${ permissions.join(',') }` : "") +
        (state ? `&state=${ state }` : "") +
        `&access_type=online` +
        `&include_granted_scopes=true`;
}

exports.redirectUrl = redirectUrl;

function getLoginHandler(appId, callbackUrl, permissions) {
    return function(req, res, next) {
        req.session.github = { state: uuid().toString() };
        req.session.save(function() {
            res.redirect(redirectUrl(appId, callbackUrl, permissions, req.session.github.state));
        });
    };
}

exports.getLoginHandler = getLoginHandler;

function getAccessToken(appId, appSecret, callbackUrl, code, cb) {
    var url = `https://github.com/login/oauth/access_token` +
        `?code=${ code }` +
        `&client_id=${ appId }` +
        `&client_secret=${ appSecret }` +
        `&redirect_uri=${ callbackUrl }` +
        `&grant_type=authorization_code`;

    https.post(url, function(response) {
        if (res.statusCode == 200) {
            response.on('data', (json) => {
                json = JSON.parse(json);
                cb(null, json);
            });
        }
        else cb(new Error("HTTP response code " + res.statusCode + "."));
    }).on('error', cb);
}

exports.getAccessToken = getAccessToken;

function getCallbackHandler(appId, appSecret, callbackUrl) {
    return function(req, res, next) {
        if (req.query.error) {
            req.error = new Error(req.query.error);
            next();
        }
        else if (req.query.code) {
            req.session.github = Object.merge(req.session.github, {
                scopes: req.query.granted_scopes.split(","),
                code: req.query.code
            });

            if (!req.query.state || req.query.state == req.session.github.state) {
                getAccessToken(appId, appSecret, callbackUrl, req.query.code, function(err, data) {
                    if (err) req.error = err;
                    else req.session.github = Object.merge(req.session.github, data);
                    req.session.save(next);
                });
            }
            else {
                req.error = new Error("CSRF check failed.");
                next();
            }
        }
        else {
            req.error = new Error("Invalid connect call.");
            next();
        }
    };
}

exports.getCallbackHandler = getCallbackHandler;

function getConnectionHandler(schema) {
    return function(req, res, next) {
        https.get("https://api.github.com/user?access_token=" + req.session.facebook.access_token, function(response) {
            if (res.statusCode == 200) {
                response.on('data', (json) => {
                    json = JSON.parse(json);
                    schema.tables.logins.connect(json, req.session.user, function(err, login) {

                    });
                });
            }
            else {
                req.error = new Error("HTTP response code " + res.statusCode + ".");
                next();
            }
        });
    };
}

exports.getConnectionHandler = getConnectionHandler;
