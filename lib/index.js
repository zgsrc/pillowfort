var dynq = require("dynq");

exports.init = function(options, cb) {
    exports.schema = dynq.connect(options).schema().require(__dirname + "/model", options);
    exports.schema.create(options, cb);
};

exports.session = require("./session");

exports.auth = require("./auth");