require("sugar");

var https = require("https");

function redirectUrl(appId, callbackUrl, permissions, state) {
    return `https://login.salesforce.com/services/oauth2/authorize?` +
        `client_id=${ appId }` +
        `&redirect_uri=${ callbackUrl }` +
        (permissions ? `&scope=${ permissions.join(' ') }` : "") +
        (state ? `&state=${ state }` : "") +
        `&response_type=code`;
}

exports.redirectUrl = redirectUrl;

function getLoginHandler(appId, callbackUrl, permissions) {
    return function(req, res, next) {
        req.session.salesforce = { state: uuid().toString() };
        req.session.save(function() {
            res.redirect(redirectUrl(appId, callbackUrl, permissions, req.session.salesforce.state));
        });
    };
}

exports.getLoginHandler = getLoginHandler;

function getAccessToken(appId, appSecret, callbackUrl, code, cb) {
    var url = `https://login.salesforce.com/services/oauth2/token?` +
        `client_id=${ appId }` +
        `&redirect_uri=${ callbackUrl }` +
        `&client_secret=${ appSecret }` +
        `&grant_type=authorization_code` +
        `&code=${ code }`;

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
            req.error = new Error(req.query.error_description);
            next();
        }
        else if (req.query.code) {
            req.session.salesforce = Object.merge(req.session.salesforce, {
                scopes: req.query.scope.split(" "),
                code: req.query.code
            });

            req.session.save(function() {
                if (!req.query.state || req.query.state == req.session.salesforce.state) {
                    accessToken(appId, appSecret, callbackUrl, req.query.code, function(err, data) {
                        if (err) req.error = err;
                        else req.session.salesforce = Object.merge(req.session.salesforce, data);
                        next();
                    });
                }
                else {
                    req.error = new Error("CSRF check failed.");
                    next();
                }
            });
        }
        else {
            req.error = new Error("Invalid connect call.");
            next();
        }
    };
}

exports.getCallbackHandler = getCallbackHandler;
