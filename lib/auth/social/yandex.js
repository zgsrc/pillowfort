require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "yandex",
    authorize: {
        url: "https://oauth.yandex.com/authorize"
    },
    accessToken: {
        url: "https://oauth.yandex.com"
    }
});
