"use strict";
// Insert uuid generation, so that dcm tests will pass.
var pack = require('../index');
var uuid = pack.uuid;
var modeling = pack.modeling;
modeling.init(pack.schema, new pack.measure.Registry());
modeling.gen_id_object.genId = uuid.v4;

module.exports = modeling;
