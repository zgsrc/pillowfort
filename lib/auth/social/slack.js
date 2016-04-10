require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "slack",
    authorize: {
        url: "https://slack.com/oauth/authorize",
        scopeDelimiter: " "
    },
    accessToken: {
        url: "https://slack.com/api/oauth.access",
        grantType: true,
        method: "POST"
    }
});
