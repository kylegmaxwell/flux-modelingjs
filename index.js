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
        if (typeof modpath === 'string')
            lazy_prop(exps, key, function () { return require(modpath); });
        else
            Object.defineProperty(exps, key, {
                enumerable: true,
                writable: false,
                value: modpath
            });
    });
    return exps;
}
/**
    Exports section

    NB: Submodules are loaded lazily here, only when they're referenced. Some submodules can
    impact load times, even when not needed at all. As an example, PBW integration tests run
    about twice the time when 'measure' is loaded eagerly. It's a large piece of ASM.JS code,
    and loading it on each script run impacts interpreter.
 */
module.exports = submodules({
    'measure':  './measure',
    'modeling': './modeling',
    'uuid':     './uuid',
    'revit':    './revit-core',
    'schemas':  submodules({
        'pbw':  './schemas/psworker.json',
        'revit':'./schemas/flux-revit.json'
    })
});
