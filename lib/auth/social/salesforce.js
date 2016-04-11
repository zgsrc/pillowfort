require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "salesforce",
    authorize: {
        url: "https://login.salesforce.com/services/oauth2/authorize"
    },
    accessToken: {
        url: "https://login.salesforce.com/services/oauth2/token"
    }
});
