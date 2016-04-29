(function (define) { /*"use strict";*/ define(function(require) {
    // TODO(andrew): should this be ./modeling-core?
    var modeling = require("modeling-core");
    // TODO(andrew): go get the schema and inject it. For now, behavior is
    // undefined for many web-based operations.
    return modeling;

});}(typeof define==='function'&&define.amd?define:function(factory){module.exports=factory(require);}));