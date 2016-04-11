var OAuth2 = require("../oauth2");

module.exports = new OAuth2({
    service: "taobao",
    authorize: {
        url: "https://oauth.taobao.com/authorize",
        scopeDelimiter: ","
    },
    accessToken: {
        url: "https://oauth.taobao.com/token"
    }
});
