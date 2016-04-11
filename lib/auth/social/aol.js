require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "aol",
    authorize: {
        url: "https://api.screenname.aol.com/auth/authorize"
    },
    accessToken: {
        url: "https://api.screenname.aol.com/auth/access_token"
    },
    profile: {
        url: "https://api.screenname.aol.com/auth/getUserData"
    }
});
