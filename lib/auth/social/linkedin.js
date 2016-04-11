require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "linkedin",
    authorize: {
        url: "https://www.linkedin.com/uas/oauth2/authorization"
    },
    accessToken: {
        url: "https://www.linkedin.com/uas/oauth2/accessToken"
    }
});
