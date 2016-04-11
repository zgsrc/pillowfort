require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "yahoo",
    authorize: {
        url: "https://api.login.yahoo.com/oauth2/request_auth"
    },
    accessToken: {
        url: "https://api.login.yahoo.com/oauth2/get_token"
    }
});
