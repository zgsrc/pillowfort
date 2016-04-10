require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "amazon",
    authorize: {
        url: "https://www.amazon.com/ap/oa",
        scopeDelimiter: "%20"
    },
    accessToken: {
        url: "https://api.amazon.com/auth/o2/token",
        grantType: true,
        method: "POST"
    },
    profile: {
        url: "https://api.amazon.com/user/profile"
    }
});
