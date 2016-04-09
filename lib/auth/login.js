require("sugar");

var schema = null;

exports.register = function(req, res, next) {
    var name = res.locals.name,
        email = res.locals.email,
        phone = res.locals.phone,
        username = req.locals.username,
        pwd = req.locals.pwd;
    
    schema.tables.logins.claim(email, false, function(err, login) {
        if (err) next(err);
        else {
            schema.tables.users.create(res.locals, function(err, user) {
                if (err) next(err);
                else next();
            });
        }
    });
};

exports.login = function(req, res, next) {
    schema.tables.logins.get(res.locals.login, function(err, login) {
        if (err) next(err);
        else {
            schema.tables.users.login(login.user, res.locals.pwd, function(err, user) {
                if (err) next(err);
                else {
                    req.session.authenticated = true;
                    req.session.privileges = user.privileges;
                    req.session.user = user;
                    req.session.login = login;
                    req.session.save(next);
                }
            });
        }
    });
};

exports.verify = function(req, res, next) {
    schema.tables.logins.verify(res.locals.login, res.locals.code, function(err) {
        if (err) next(err);
        else next();
    });
};

exports.forgotPwd = function(req, res, next) {
    schema.tables.users.forgotPwd(res.locals.user, function(err) {
        if (err) next(err);
        else next();
    });
};

exports.resetPwd = function(req, res, next) {
    schema.tables.users.changePwd(res.locals.user, res.locals.code, function(err) {
        if (err) next(err);
        else next();
    });
};

exports.changePwd = function(req, res, next) {
    schema.tables.users.changePwd(req.session.user, res.locals.old, res.locals.pwd, function(err) {
        if (err) next(err);
        else next();
    });
};

exports.logout = function(req, res, next) {
    req.session.destroy(next);
};