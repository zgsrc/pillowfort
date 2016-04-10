var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "wordpress",
    authorize: {
        url: "https://public-api.wordpress.com/oauth2/authorize",
        scopeDelimiter: ","
    },
    accessToken: {
        url: "https://public-api.wordpress.com/oauth2/token",
        grantType: true,
        method: "POST"
    }
});
