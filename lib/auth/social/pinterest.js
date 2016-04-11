var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "pinterest",
    authorize: {
        url: "https://api.pinterest.com/oauth/",
        scopeDelimiter: ","
    },
    accessToken: {
        url: "https://api.pinterest.com/v1/oauth/token"
    }
});
