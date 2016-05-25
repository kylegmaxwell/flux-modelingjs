/** @file Export declaration for submodules
 *  All submodules are fetched lazily, on first request
 *  @author Igor Baidiuk <ibaidiuk@amcbridge.com>
 */
/* jslint node:true */
"use strict";
/*
    Adds property to object whose value will be computed only on first access
*/
function lazy_prop(obj, prop, initializer) {
    Object.defineProperty(obj, prop, {
        configurable: true,
        enumerable:   false,
        get: function () {
            var value = initializer();
            Object.defineProperty(this, prop, {
                enumerable: true,
                value:      value
            });
            return value;
        }
    });
}

function submodules(obj) {
    var exps = {};
    Object.keys(obj).forEach(function (key) {
        var modpath = obj[key];
        lazy_prop(exps, key, function () { return require(modpath); });
    });
    return exps;
}

module.exports = submodules({
    'measure':  './measure',
    'modeling': './modeling-core',
    'uuid':     './uuid',
    'revit': './revit-core',
    'fluxEntitySchema':   './schemas/psworker.json',
    'fluxRevitSchema': './schemas/flux-revit.json'
});
