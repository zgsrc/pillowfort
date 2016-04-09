require("sugar");
require("chai").should();

var fs = require("fs"),
    dynq = require("dynq"),
    pf = null;

describe('Module', function() {
    
    it("ain't broke", function() {
        pf = require("../index");
    });
    
    it("has a valid login table schema", function() {
        require(__dirname + "/../lib/model/logins");
    });
    
    it("has a valid session table schema", function() {
        require(__dirname + "/../lib/model/session");
    });

    it("has a valid users table schema", function() {
        require(__dirname + "/../lib/model/users");
    });
    
    var cxn = null;
    var config = JSON.parse(fs.readFileSync(__dirname + "/config.json"));
    it("can create a connection", function() {
        cxn = require("dynq").config(config.aws).connect();
    });
    
    var schema = null;
    it("can initialize", function(done) {
        if (cxn) {
            this.timeout(120000);
            pf.initialize(cxn, { tablePrefix: "SEC_" }, function(err, scheme) {
                if (err) throw err;
                else schema = scheme;
                done();
            });
        }
        else done();
    })
    
    it("can drop schema", function(done) {
        if (schema) {
            this.timeout(120000);
            schema.drop(function(err) {
                if (err) throw err;
                else done();
            });
        }
        else done();
    })
    
});
