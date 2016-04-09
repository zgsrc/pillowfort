var url = require("url"),
    gencall = require("gencall"),
    facebook = require("./facebook"),
    google = require("./google"),
    login = require("./login");

module.exports = function(options) {

    var router = gencall.router(options);

    if (options.login) {
        router.post("/register").process(login.register);
        router.getPost("/verify").process(login.verify);
        
        router.post("/login").process(login.login);
        router.get("/logout").process(login.logout);

        router.getPost("/pwd/forgot").process(login.forgotPwd);
        router.get("/pwd/reset").process(login.resetPwd);
        router.post("/pwd/set").process(login.resetPwd);
        router.post("/pwd/change").process(login.changePwd);
    }
    
    if (options.facebook) {
        var callbackUrl = url.resolve(options.domain, "/facebook/connect");
        
        router.get("/facebook/login").process(
            facebook.getLoginHandler(options.facebook.id, callbackUrl, options.facebook.permissions)
        );

        router.get("/facebook/connect").process(
            facebook.getCallbackHandler(options.facebook.id, options.facebook.secret, callbackUrl)
        );
    }
    
    if (options.google) {
        var callbackUrl = url.resolve(options.domain, "/google/connect");

        router.get("/google/login").process(
            google.getLoginHandler(options.google.id, callbackUrl, options.google.permissions)
        );
        
        router.get("/google/connect").process(
            google.getCallbackHandler(options.google.id, options.google.secret, callbackUrl)
        );
    }
    
    return router;

};
