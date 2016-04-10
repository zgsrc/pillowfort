require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "yammer",
    authorize: {
        url: "https://www.yammer.com/oauth2/authorize",
        scopeDelimiter: ","
    },
    accessToken: {
        url: "https://www.yammer.com/oauth2/access_token",
        grantType: true,
        method: "POST"
    }
});
