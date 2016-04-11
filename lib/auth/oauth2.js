"use strict";

require("sugar");

var request = require("request"),
    url = require("url"),
    qs = require("querystring");

class OAuth2 {

    constructor(options) {
        this.options = options;

        if (Object.isString(this.options.authorize)) {
            this.options.authorize = { url: this.options.authorize };
        }

        if (Object.isString(this.options.accessToken)) {
            this.options.accessToken = { url: this.options.accessToken };
        }

        if (Object.isString(this.options.profile)) {
            this.options.profile = { url: this.options.profile };
        }
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

        if (this.options.authorize.additional) {
            var additional = this.options.authorize.additional;

            if (Object.isObject(additional)) {
                additional = qs.stringify(additional);
            }

            if (!additional.startsWith("&")) {
                additional = "&" + additional;
            }

            url += additional;
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

        if (this.options.accessToken.grantType) {
            parameters.grant_type = this.options.accessToken.grantType;
        }
        else if (!this.options.accessToken.noGrantType) {
            parameters.grant_type = "authorization_code";
        }

        if (this.options.accessToken.additional) {
            parameters = Object.merge(parameters, this.options.accessToken.additional);
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
            var uri = url.parse(this.options.profile.url, true, true);
            uri.query.access_token = req.session[this.options.service].access_token;

            request.get(url.format(uri), function(err, response, body) {
                if (response.statusCode == 200) {
                    var profile = JSON.parse(body.toString()),
                        id = options.service + "/" + profile[options.profile.id || "id"];

                    if (req.session.user) {
                        schema.tables.logins.connect(id, options.service, profile, req.session.user, function(err, login) {
                            req.session.login = login;
                            req.session.save(next);
                        });
                    }
                    else {
                        schmea.tables.users.create({ }, function(err, user) {
                            schema.tables.logins.connect(id, options.service, profile, user, function(err, login) {
                                req.session.authenticated = true;
                                req.session.user = user;
                                req.session.login = login;
                                req.session.save(next);
                            });
                        });
                    }

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
        responseType: "code,granted_scopes",
        additional: "&some=param" || { }
    },
    accessToken: {
        url: "url",
        noGrantType: false,
        grantType: "some",
        method: "POST",
        additional: { }
    },
    profile: {
        url: "url",
        id: "id"
    }
});
*/
