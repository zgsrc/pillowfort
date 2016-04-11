var url = require("url"),
    gencall = require("gencall"),
    auth = require("./auth");

module.exports = function(options) {

    var router = gencall.router(options);

    if (options.login) {
        router.post("/register")
            .params(auth.login.register.interface)
            .process(auth.login.register);

        router.getPost("/verify")
            .params(auth.login.verify.interface)
            .process(auth.login.verify);

        router.post("/login")
            .params(auth.login.login.interface)
            .process(auth.login.login);

        router.get("/logout")
            .process(auth.login.logout);

        router.getPost("/pwd/forgot")
            .params(auth.login.forgotPwd.interface)
            .process(auth.login.forgotPwd);

        router.get("/pwd/reset")
            .params(auth.login.resetPwd.interface)
            .process(auth.login.resetPwd);

        router.post("/pwd/set")
            .params(auth.login.setPwd.interface)
            .process(auth.login.setPwd);

        router.post("/pwd/change")
            .params(auth.login.changePwd.interface)
            .process(auth.login.changePwd);
    }

    Object.keys(options).exclude("login").forEach(service => {
        var social = auth.social[service];
        if (social) {
            var callbackUrl = url.resolve(options.domain, "/" + service + "/callback");

            router.get("/" + service + "/login").process(
                social.authorizeMiddleware(options[service].id, callbackUrl, options[service].permissions)
            );

            router.get("/" + service + "/callback").process(
                social.callbackMiddleware(options[service].id, options[service].secret, callbackUrl)
            );

            router.get("/" + service + "/connect").process(
                social.connectMiddleware(options.schema)
            );
        }
        else {
            var serviceName = service.length > 2 ? service.captialize() : service.toUpperCase();
            throw new Error(serviceName + " social connector does not exist.");
        }
    });

    return router;

};
