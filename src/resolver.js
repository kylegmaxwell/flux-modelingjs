'use strict';

import * as utilities from './utilities.js';

//******************************************************************************
// Resolver becoming kind of scope stuff
// TODO:(Kyle) I think the whole resolver business could be a lot simpler.

/**
 * Initialize the previous resolver singleton to a function that returns nothing
 */
var prevResolver = function () {};


/**
 * Resolve an item with the last set resolver.
 *
 * @param  {Object} item Something in a query.
 * @return {Object}      The resolved item.
 */
export function resolve(item) {
    return prevResolver(item);
}

// This function is madness
function withResolver(resolver, lambda) {
    var prev = prevResolver;
    prevResolver = resolver;
    try {
        return lambda();
    }
    finally {
        prevResolver = prev;
    }
}

/* Resolves Entity or Operation object into its name in query
   Entities without a name are assigned with autogenerated name
   Operations without a name return no name and thus expanded in-place

   @param  {Entity|Operation} object to be resolved
   @param  {number}           index  index of current operation block, used to block forward lookups
   @return {string}                    item name, if any
 */
function resolveItem(_this, e, opIndex) {
    var key;
    if (utilities.isEntity(e)) {
        Object.keys(_this.entities).forEach(function (k) {
            if (!key && _this.entities[k] === e) {
                key = k;
            }
        });
        if (!key) {
            key = _this.generateName(e.primitive);
            _this.entities[key] = e;
        }
        return key;
    }
    else if (e.isOperation) {
        var ops = _this.operations;
        var i;

        // find latest binding
        for (i = opIndex - 1; i >= 0; i -= 1) {
            var item = ops[i];
            if (item.operation === e) {
                key = item.name;
                break;
            }
        }
        // check if binding wasn't overridden later
        if (key)
            for (var j = opIndex - 1; j > i; j -= 1)
                if (ops[j].name === key)
                    return undefined;

        return key;
    }
}


/**
 * Dump operations to json and resolve references to entities so that
 * they are included in the query.
 * @param  {Object} _this Pointer to the current object
 * @return {Array.<Operations>}      New list of resolved operations
 */
export function dumpOperations(_this) {
    function resolver(index) {
        return function(e) { return resolveItem(_this, e, index); };
    }

    return _this.operations.map(
        function (item, index) {
            return withResolver(
                resolver(index),
                function () {
                    return item.toJSON();
                }
            );
        }
    );
}