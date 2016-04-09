require("sugar");

var schema = null;

exports.registerWithEmail = function(req, res, next) {
    var name = req.params.name || req.body.name || req.query.name,
        email = req.params.email || req.body.email || req.query.email,
        pwd = req.params.pwd || req.body.pwd || req.query.pwd;
    
    schema.tables.logins.claim(email, false, function(err, login) {
        if (err) next(err);
        else {
            schema.tables.users.create(function(err, user) {
                if (err) next(err);
                else {
                    
                }
            });
        }
    });
    
    next();
};

exports.login = function(req, res, next) {
    var login = req.params.login || req.body.login || req.query.login,
        pwd = req.params.pwd || req.body.pwd || req.query.pwd;
    
    schema.tables.logins.get(login, function(err, login) {
        if (err) next(err);
        else {
            schema.tables.users.login(login.user, pwd, function(err, user) {
                if (err) next(err);
                else {
                    req.session.user = user;
                    req.session.login = login;
                    req.session.save(next);
                }
            });
        }
    })
    
    next();
};

exports.verify = function(req, res, next) {
    var login = req.params.login || req.body.login || req.query.login,
        code = req.params.code || req.body.code || req.query.code;
    
    schema.tables.logins.verify(login, code, function(err) {
        if (err) next(err);
        else {
            
        }
    });
    
    next();
};

exports.forgotPwd = function(req, res, next) {
    schema.tables.users.forgotPwd(req.session.user, old, pwd, function(err) {
        
    });
};

exports.resetPwd = function(req, res, next) {
    var code = req.params.code || req.body.code || req.query.code;
    schema.tables.users.changePwd(req.session.user, code, function(err) {
        
    });
};

exports.changePwd = function(req, res, next) {
    var pwd = req.params.pwd || req.body.pwd || req.query.pwd,
        old = req.params.old || req.body.old || req.query.old;
    
    schema.tables.users.changePwd(req.session.user, old, pwd, function(err) {
        
    });
};

exports.logout = function(req, res, next) {
    req.session.destroy(next);
};