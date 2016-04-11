require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "google",
    authorize: {
        url: "https://accounts.google.com/o/oauth2/v2/auth"
    },
    accessToken: {
        url: "https://www.googleapis.com/oauth2/v4/token"
    }
});
