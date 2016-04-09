"use strict";

var provider = require("express-session");

exports.memory = function(options) {
    return provider({
        name: options.name || "sid",
        secret: options.secret,
        cookie: options.cookie || { path: "/", httpOnly: true, secure: false, maxAge: options.maxAge || null },
        resave: options.resave || false,
        saveUninitialized: options.saveUninitialized || false
    });
};

exports.dynamo = function(schema, options) {
    return provider({ 
        name: options.name || "sid",
        secret: options.secret,
        store: new DynqStore(schema, options),
        proxy: options.proxy || true,
        cookie: options.cookie || { path: "/", httpOnly: true, secure: options.secure || "auto", maxAge: options.maxAge || null },
        resave: options.resave || false,
        saveUninitialized: options.saveUninitialized || false
    });
};

class DynqStore extends provider.Store {
    constructor(schema, options) {
        super(options);
        this.schema = schema;
        setInterval(() => { 
            var olderThan = (options.duration ? Date.create(options.duration + " ago") : null);
            schema.tables.sessions.destroyIdleSessions(olderThan, (err) => {
                if (err) console.log(err);
            });
        }, options.interval || 600000);
    }
    
    get(sid, cb) { 
        this.schema.tables.sessions.getSession(sid, cb); 
    }
    
    set(sid, obj, cb) { 
        this.schema.tables.sessions.setSession(sid, obj, cb); 
    }
    
    touch(sid, obj, cb) { 
        this.schema.tables.sessions.touchSession(sid, obj, cb); 
    }
    
    destroy(sid, cb) { 
        this.schema.tables.sessions.destroySession(sid, obj, cb); 
    }
};

exports.DynqStore = DynqStore;