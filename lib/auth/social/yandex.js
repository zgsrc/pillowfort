require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "yandex",
    authorize: {
        url: "https://oauth.yandex.com/authorize",
        scopeDelimiter: " "
    },
    accessToken: {
        url: "https://oauth.yandex.com",
        grantType: true,
        method: "POST"
    }
});
