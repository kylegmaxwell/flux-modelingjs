(function (define) { "use strict"; define(function(require) {
    // Insert uuid generation, so that dcm tests will pass.
    var uuid = require('../uuid');
    var modeling = require("../modeling");
    modeling.gen_id_object.genId = uuid.v4;
return modeling;
});}(typeof define==='function'&&define.amd?define:function(factory){module.exports=factory(require);}));