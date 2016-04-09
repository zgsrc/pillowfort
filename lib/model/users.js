require("sugar");

var async = require("async"),
    uuid = require("node-uuid"),
    bcrypt = require('bcrypt-nodejs');

module.exports = {
    name: "Users",
    key: { id: "text" }, 
    indices: {
        ByTimestamp: {
            columns: { timestamp: "number" },
            project: "KEYS_ONLY"
        }
    },
    methods: function(table) {

        this.create = function(user, cb) {
            if (!user.id) user.id = uuid().toString();
            if (!user.created) user.created = Date.utc.create();
            table.write(user).select("ALL_NEW").insert(cb);
        };

        this.modify = function(user, cb) {
            if (!user.id) cb(new Error("Cannot modify user without id."));
            else {
                user.modified = Date.utc.create().getTime();
                table.edit(user).change(user).select("ALL_NEW").update(cb);
            }
        };

        this.login = function(user, pwd, cb) {
            table.get(user.id || user, function(err, user) {
                if (err) cb(err);
                else if (user) {
                    bcrypt.compare(oldPwd, user.pwd, function(err, valid) {
                        if (err) cb(err);
                        else if (!valid) {
                            table.edit(user).add({ invalidLoginAttempts: 1 }).update(function(err) {
                                cb(err || new Error("Incorrect login or password."));
                            });
                        }
                        else {
                            table.edit(user).add({ invalidLoginAttempts: 0 }).select("ALL_NEW").update(cb);
                        }
                    });
                }
                else cb(new Error("Could not find user."));
            });
        };
        
        this.changePwd = function(user, oldPwd, newPwd, cb) {
            table.get(user.id || user, function(err, user) {
                if (err) cb(err);
                else if (user) { 
                    bcrypt.compare(oldPwd, user.pwd, function(err, valid) {
                        if (err) cb(err);
                        else if (valid) {
                            bcrypt.hash(newPwd, 10, null, function(err, hash) { 
                                if (err) cb(err);
                                else {
                                    user.pwd = hash.toString();
                                    table.edit(id).change({ 
                                        pwd: hash.toString() 
                                    }).select("ALL_NEW").update(cb);
                                }
                            });
                        }
                        else cb(new Error("Incorrect current password."));
                    });
                }
                else cb(new Error("Could not find login '" + id + "'."));
            });
        }

        this.setPwd = function(user, newPwd, cb) {
            bcrypt.hash(newPwd, 10, null, function(err, hash) { 
                if (err) cb(err);
                else {
                    table.edit(user.id || user).change({ 
                        pwd: hash.toString() 
                    }).select("ALL_NEW").update(cb);
                }
            });
        };
        
        this.forgotPwd = function(user, cb) {
            table.get(user.id || user, function(err, user) {
                if (err) cb(err);
                else if (!user) cb(new Error("No user for login " + login + "."));
                else {
                    if (user.pwdResetExpiry == null || user.pwdResetExpiry < Date.utc.create().getTime()) {
                        table.edit(user).change({
                            pwdResetRequested: Date.utc.create().getTime(),
                            pwdResetConfirmation: uuid().toString() + uuid().toString(),
                            pwdResetExpiry: Date.utc.create().addDays(10).getTime()
                        }).select("ALL_NEW").update(cb);
                    }
                    else cb(null, user);
                }
            });
        };

        this.resetPwd = function(user, confirmation, cb) {
            table.get(user.id || user, function(err, user) {
                if (err) cb(err);
                else if (!user) cb(new Error("No such user."));
                else {
                    if (user.pwdResetConfirmation == confirmation) {
                        if (parseInt(user.pwdResetExpiry) < Date.utc.create().getTime()) {
                            cb(new Error("Password reset code is no longer valid."));
                        }
                        else {
                            table.edit(user).change({
                                pwdResetRequested: null,
                                pwdResetConfirmation: null,
                                pwdResetExpiry: null,
                                pwd: null
                            }).select("ALL_NEW").update(cb).debug();
                        }
                    }
                    else cb(new Error("Invalid password reset confirmation code."));
                }
            });
        };
        
        this.lock = function(user, cb) {
            Users.edit(user.id || user).change({ locked: true }).update(cb);
        };

        this.unlock = function(user, cb) {
            Users.edit(user.id || user).change({ locked: false }).update(cb);
        };
        
        this.is = function(id, role, cb) {
            table.getPart(id, [ "roles" ], function(err, user) {
                if (err) cb(err);
                else if (user && user.roles) cb(null, roles.indexOf(role) >= 0);
                else cb(null, false);
            });
        };

        this.grant = function(id, role, cb) {
            table.edit(id).add({ roles: [ role ] }).update(cb);
        };

        this.rescind = function(id, role, cb) {
            table.edit(id).remove({ roles: [ role ] }).update(cb);
        };
        
    }
};