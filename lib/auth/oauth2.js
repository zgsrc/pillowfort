"use strict";

require("sugar");

var request = require("request"),
    url = require("url");

class OAuth2 {

    constructor(options) {
        this.options = options;
    }

    authorizeUrl(appId, callbackUrl, permissions, state) {
        var url = this.options.authorize.url + `?client_id=${ appId }&redirect_uri=${ callbackUrl }`;

        var scope = null;
        if (permissions) {
            if (Array.isArray(permissions)) {
                url += `&scope=${ permissions.join(this.options.authorize.scopeDelimiter || " ") }`;
            }
            else {
                url += `&scope=${ permissions }`;
            }
        }

        if (state) {
            url += `&state=${ state }`;
        }

        if (this.options.authorize.responseType) {
            url += `&response_type=${ this.options.authorize.responseType }`;
        }
        else {
            url += `&response_type=code`;
        }

        return url;
    }

    accessTokenParameters(appId, appSecret, callbackUrl, code) {
        var parameters = {
            client_id: appId,
            client_secret: appSecret,
            redirect_url: callbackUrl,
            code: code
        };

        if (this.options.accessToken.grantTypeOverride) {
            parameters.grant_type = this.options.accessToken.grantTypeOverride;
        }
        else if (this.options.accessToken.grantType) {
            parameters.grant_type = "authorization_code";
        }

        return parameters;
    }

    getAccessToken(appId, appSecret, callbackUrl, code, cb) {
        var param = this.accessTokenParameters(appId, appSecret, callbackUrl, code),
            opt = {
                url: this.options.accessToken.url,
                method: this.options.accessToken.method || "GET"
            };

        if (opt.method.toLowerCase() == "get") opt.qs = param;
        else opt.body = param;

        request(opt, function(err, res, body) {
            if (res.statusCode == 200) {
                cb(null, JSON.parse(body.toString()));
            }
            else {
                cb(new Error("HTTP response code " + res.statusCode + "."));
            }
        });
    }

    authorizeMiddleware(appId, callbackUrl, permissions) {
        return function(req, res, next) {
            req.session[this.options.service] = {
                state: uuid().toString(),
                scope: permissions
            };

            req.session.save(function() {
                res.redirect(this.authorizeUrl(appId, callbackUrl, permissions, req.session[this.options.service].state));
            });
        };
    }

    callbackMiddleware(appId, appSecret, callbackUrl) {
        return function(req, res, next) {
            if (req.query.error) {
                req.error = new Error(req.query.error_description);
                next();
            }
            else if (req.query.code) {
                if (req.query.granted_scopes) {
                    req.session[this.options.service].scope = req.query.granted_scopes.split(this.options.authorize.scopeDelimiter || " ");
                }
                else if (req.query.scope) {
                    req.session[this.options.service].scope = req.query.scope.split(this.options.authorize.scopeDelimiter || " ");
                }

                req.session[this.options.service].code = req.query.code;

                req.session.save(function() {
                    if (!req.query.state || req.query.state == req.session[this.options.service].state) {
                        this.getAccessToken(appId, appSecret, callbackUrl, req.query.code, function(err, data) {
                            if (err) req.error = err;
                            else req.session[this.options.service] = Object.merge(req.session[this.options.service], data);
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

    connectMiddleware(schema) {
        return function(req, res, next) {
            request.get(this.options.profile.url + "?access_token=" + req.session.amazon.access_token, function(err, response, body) {
                if (response.statusCode == 200) {
                    var profile = JSON.parse(body.toString());
                    profile.service = options.service;
                    profile.unique = options.service + "/" + profile[options.profile.id || "id"];

                    schema.tables.logins.connect(profile, req.session.user, function(err, login) {

                    });
                }
                else {
                    next(new Error("HTTP response code " + response.statusCode + "."));
                }
            });
        };
    }

}

module.exports = OAuth2;

/*
var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "facebook",
    authorize: {
        url: "url",
        scopeDelimiter: "%20",
        responseType: "code,granted_scopes"
    },
    accessToken: {
        url: "url",
        grantType: true,
        grantTypeOverride: "some",
        method: "POST"
    },
    profile: {
        url: "url",
        id: "id"
    }
});
*/
