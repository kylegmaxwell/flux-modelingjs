// TODO(andrew): should this file be named "modeling-lib" or "modeling-server"?
// This would be symmetric with modeling-web. Ideally, we would solve the issue
// packaging psworker.json in a way that such a split is not necessary. Until we
// reach a conclusion (either way) on that, maintain the existing modeling.js
// name for compatability with existing users.
var modeling = require("./modeling-core.js");
// Inject the schema and a measure registryl
var schema = require("./schemas/psworker.json");
var measure = require("./measure.js");
var registry = new measure.Registry();
modeling.init(schema, registry);

// Public API
module.exports = modeling;
