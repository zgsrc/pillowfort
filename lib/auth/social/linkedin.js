require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "facebook",
    authorize: {
        url: "https://www.linkedin.com/uas/oauth2/authorization",
        scopeDelimiter: " "
    },
    accessToken: {
        url: "https://www.linkedin.com/uas/oauth2/accessToken",
        grantType: true,
        method: "POST"
    }
});
