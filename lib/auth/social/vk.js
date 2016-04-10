require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "vk",
    authorize: {
        url: "https://oauth.vk.com/authorize",
        scopeDelimiter: " "
    },
    accessToken: {
        url: "https://oauth.vk.com/access_token",
        grantType: true,
        method: "POST"
    }
});
