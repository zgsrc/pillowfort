var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "baidu",
    authorize: {
        url: "http://openapi.baidu.com/oauth/2.0/authorize",
        scopeDelimiter: ","
    },
    accessToken: {
        url: "https://openapi.baidu.com/oauth/2.0/token"
    }
});
