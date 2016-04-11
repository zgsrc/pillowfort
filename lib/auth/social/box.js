require("sugar");

var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "box",
    authorize: {
        url: "https://account.box.com/api/oauth2/authorize",
        additional: "&access_type=online&include_granted_scopes=true"
    },
    accessToken: {
        url: "https://api.box.com/oauth2/token"
    }
});
