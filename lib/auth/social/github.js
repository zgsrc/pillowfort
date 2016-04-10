require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "github",
    authorize: {
        url: "https://github.com/login/oauth/authorize",
        scopeDelimiter: "%20"
    },
    accessToken: {
        url: "https://github.com/login/oauth/access_token",
        grantType: true,
        method: "POST"
    },
    profile: {
        url: "https://api.github.com/user"
    }
});
