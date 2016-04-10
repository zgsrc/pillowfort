require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "microsoft",
    authorize: {
        url: "https://login.live.com/oauth20_authorize.srf",
        scopeDelimiter: " "
    },
    accessToken: {
        url: "https://login.live.com/oauth20_token.srf",
        grantType: true,
        method: "POST"
    },
    profile: {
        url: "url"
    }
});
