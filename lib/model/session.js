require("sugar");

var async = require("async"),
    uuid = require("node-uuid"),
    bcrypt = require('bcrypt-nodejs');

module.exports = {
    name: "Sessions",
    key: { id: "text", timestamp: "number" }, 
    indices: {
        ByTimestamp: {
            columns: { temporary: "boolean", timestamp: "number" },
            project: "KEYS_ONLY"
        }
    },
    methods: function(table) {
        
        this.destroySession = function(sid, cb) {
            table.delete(sid, cb);
        };
        
        this.getSession = function(sid, cb) {
            table.get(sid, function(err, item) {
                if (err) cb(err);
                else if (item.json) cb(null, JSON.parse(item.json));
                else cb(null, { });
            });
        };
        
        this.setSession = function(sid, obj, cb) {
            table.edit(sid).change({
                json: JSON.stringify(obj),
                temporary: true,
                timestamp: Date.create().getTime()
            }).update(cb);
        };
        
        this.touchSession = function(sid, obj, cb) {
            table.edit(sid).change({
                timestamp: Date.create().getTime()
            }).update(cb);
        };
        
        this.destroyIdleSessions = function(before, cb) {
            before = before || Date.create("1 hour ago");
            table.byTimestamp.filter({
                temporary: [ "EQ", true ],
                timestamp: [ "LT", before.getTime() ]
            }).delete().all((err) => { if (cb) cb(err); });
        };
        
    }
};