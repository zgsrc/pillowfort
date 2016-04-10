require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "instagram",
    authorize: {
        url: "https://api.instagram.com/oauth/authorize/",
        scopeDelimiter: "+"
    },
    accessToken: {
        url: "https://api.instagram.com/oauth/access_token",
        grantType: true,
        method: "POST"
    }
});
