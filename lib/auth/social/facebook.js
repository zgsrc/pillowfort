require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "facebook",
    authorize: {
        url: "https://www.facebook.com/dialog/oauth",
        scopeDelimiter: ",",
        responseType: "code,granted_scopes"
    },
    accessToken: {
        url: "https://graph.facebook.com/v2.3/oauth/access_token"
    },
    profile: {
        url: "https://graph.facebook.com/me"
    }
});
