require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "box",
    authorize: {
        url: "https://account.box.com/api/oauth2/authorize",
        scopeDelimiter: "%20",
        additional: "&access_type=online&include_granted_scopes=true"
    },
    accessToken: {
        url: "https://api.box.com/oauth2/token",
        grantType: "true",
        grantTypeOverride: "some",
        method: "POST"
    },
    profile: {
        url: "url"
    }
});
