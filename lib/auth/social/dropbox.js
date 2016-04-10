require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "dropbox",
    authorize: {
        url: "https://www.dropbox.com/1/oauth2/authorize",
        scopeDelimiter: "%20"
    },
    accessToken: {
        url: "https://www.dropbox.com/1/oauth2/token",
        grantType: true,
        method: "POST"
    },
    profile: {
        url: "url"
    }
});
