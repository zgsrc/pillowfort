require("sugar");

var https = require("https");

function redirectUrl(appId, callbackUrl, permissions, state) {
    return `https://www.facebook.com/dialog/oauth?client_id=${ appId }` +
        `&redirect_uri=${ callbackUrl }` +
        (permissions ? `&scope=${ permissions.join(',') }` : "") +
        (state ? `&state=${ state }` : "") +
        `&response_type=code,granted_scopes`;
}

exports.redirectUrl = redirectUrl;

function getLoginHandler(appId, callbackUrl, permissions) {
    return function(req, res, next) {
        req.session.facebook = { state: uuid().toString() };
        req.session.save(function() {
            res.redirect(redirectUrl(appId, callbackUrl, permissions, req.session.facebook.state));
        });
    };
}

exports.getLoginHandler = getLoginHandler;

function getAccessToken(appId, appSecret, callbackUrl, code, cb) {
    var url = `https://graph.facebook.com/v2.3/oauth/access_token?client_id=${ appId }` + 
        `&redirect_uri=${ callbackUrl }` + 
        `&client_secret=${ appSecret }` + 
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
            req.session.facebook = Object.merge(req.session.facebook, {
                scopes: req.query.granted_scopes.split(","),
                code: req.query.code
            });
            
            req.session.save(function() {
                if (!req.query.state || req.query.state == req.session.facebook.state) {
                    accessToken(appId, appSecret, callbackUrl, req.query.code, function(err, data) {
                        if (err) req.error = err;
                        else req.session.facebook = Object.merge(req.session.facebook, data);
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

function getConnectionHandler(schema) {
    return function(req, res, next) {
        https.get("https://graph.facebook.com/me?access_token=" + req.session.facebook.access_token, function(response) {
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
