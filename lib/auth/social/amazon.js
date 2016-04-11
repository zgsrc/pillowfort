require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "amazon",
    authorize: {
        url: "https://www.amazon.com/ap/oa"
    },
    accessToken: {
        url: "https://api.amazon.com/auth/o2/token"
    },
    profile: {
        url: "https://api.amazon.com/user/profile"
    }
});
