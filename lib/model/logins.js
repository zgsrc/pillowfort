require("sugar");

var async = require("async"),
    uuid = require("node-uuid"),
    bcrypt = require('bcrypt-nodejs');

module.exports = {
    name: "Logins",
    key: { id: "text", timestamp: "number" }, 
    indices: {
        ByUser: {
            columns: { user: "text", timestamp: "number" },
            project: "KEYS_ONLY"
        },
        ByTimestamp: {
            columns: { timestamp: "number" },
            project: "KEYS_ONLY"
        }
    },
    methods: function(table) {
        
        this.forUser = function(user, cb) {
            table.byUser.conditions({ 
                user: [ "EQ", (user.id || user) ] 
            }).all(function(err, ids) {
                if (err) cb(err);
                else table.getAll(ids.items, cb);
            });
        };
        
        this.claim = function(id, cb) {
            var login = { 
                id: id,
                created: Date.utc.create()    
            };
            
            table.write(login).insert(function(err, data) {
                if (err && err.code == "ConditionalCheckFailedException") {
                    cb(new Error("Login '" + login.id + "' is already claimed by another user."));
                }
                else cb(err, data);
            });
        };
        
        this.connect = function(profile, user, cb) {
            table.upsert({ 
                id: profile.unique,
                user: user.id || user,
                profile: profile,
                created: Date.create(),
                timestamp: Date.create().getTime(),
                verified: true
            }, cb);
        };
        
        this.verify = function(login, user, code, cb) {
            table.getPart(login.id || login, [ "id", "user", "verified", "verification" ], function(err, login) {
                if (err) cb(err);
                else {
                    if (!login.verified && login.verification == code) {
                        table.edit(login).change({
                            user: user.id || user,
                            verified: Date.utc.create().getTime(),
                            verification: null
                        }).select("ALL_NEW").update(cb);
                    }
                    else cb(new Error("Invalid login or verification code."));
                }
            });
        };

        this.bind = function(login, user, cb) {
            Logins.edit(login).change({ 
                user: (user.id || user) 
            }).select("ALL_NEW").update(cb);
        };

        this.free = function(login, cb) {
            Logins.edit(login).change({
                user: null, 
                verified: null, 
                verification: uuid().toString(), 
                freed: Date.utc.create().getTime() 
            }).select("ALL_NEW").update(cb);
        };      
        
    }
};
