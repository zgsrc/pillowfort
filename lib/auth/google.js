require("sugar");

var https = require("https");

function redirectUrl(appId, callbackUrl, permissions, state) {
    var url = `https://accounts.google.com/o/oauth2/v2/auth` + 
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
        req.session.google = { state: uuid().toString() };
        req.session.save(function() {
            res.redirect(redirectUrl(appId, callbackUrl, permissions, req.session.google.state));
        });
    };
}

exports.getLoginHandler = getLoginHandler;

function getAccessToken(appId, appSecret, callbackUrl, code, cb) {
    var url = `https://www.googleapis.com/oauth2/v4/token` +
        `?code=${ code }` +
        `&client_id=${ appId }` +
        `&client_secret=${ appSecret }` +
        `&redirect_uri=${ callbackUrl }` +
        `&grant_type=authorization_code`;

    https.get(url, function(response) {
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
            req.session.google = Object.merge(req.session.google, {
                scopes: req.query.granted_scopes.split(","),
                code: req.query.code
            });
            
            if (!req.query.state || req.query.state == req.session.google.state) {
                getAccessToken(appId, appSecret, callbackUrl, req.query.code, function(err, data) {
                    if (err) req.error = err;
                    else req.session.google = Object.merge(req.session.google, data);
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