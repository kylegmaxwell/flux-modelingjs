'use strict';

import * as types from '../types.js';

/** Helper function
    @private
    @param  {string}   typeid  name of entity type, value for 'primitive' property
    @param  {any}      params  additional parameters of entity
    @return {Entity}             Entity or any other type specified by OptCtor
*/
export default function primitive(typeid, params) {
    var e = {primitive: typeid};
    initObject(e, params);
    e.primitive = typeid;
    e.units = types.defaultUnits(typeid);
    return e;
}

function initObject(dest, source) {
    if (typeof source !== "object")
        throw new Error("source: expected object");
    if (typeof dest !== "object")
        throw new Error("dest: expected object");
    for (var key in source)
        dest[key] = source[key];
}
