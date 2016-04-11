var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "qq",
    authorize: {
        url: "https://graph.qq.com/oauth2.0/authorize",
        scopeDelimiter: " "
    },
    accessToken: {
        url: "https://graph.qq.com/oauth2.0/token"
    }
});
