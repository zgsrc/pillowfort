require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "microsoft",
    authorize: {
        url: "https://login.live.com/oauth20_authorize.srf"
    },
    accessToken: {
        url: "https://login.live.com/oauth20_token.srf"
    }
});
