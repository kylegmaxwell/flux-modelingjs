'use strict';
/** Helper functions and classes to generate valid JSON queries to Geometry Worker server.
 *  Use {@link query} as a starting point
 */

/* jslint node:true */

/***************************************************************************************************
 *  Configuration part
 */
import * as utilities from './utilities.js';
import Operation from './Operation.js';
import OpSlot from './OpSlot.js';
import FluxModelingError from './FluxModelingError.js';
import { dumpOperations } from './resolver.js';

//******************************************************************************
// Type declarations
//******************************************************************************
/** Use factory function {@link query}
 *  @class
 *  @classdesc Represents block query as query, with geometrical entities and operations over there
 */
export default function Query() {
    this.entities   = {};
    this.operations = [];

    var counter = 1;
    this.generateName = function (prefix) {
        var name = prefix + '@' + counter;
        counter += 1;
        return name;
    };
}

/** Converts Query object to JSON representation
 *  Adds custom-conversion support for {@link JSON.stringify}
 *
 *  @return {*} JSON-ready object
 */
Query.prototype.toJSON  = function () {
    var ops = dumpOperations(this);
    return {
        Entities:   this.entities,
        Operations: ops
    };
};

/** Adds entity/operation to query
 *
 *  @param  {string}             name - name of item being added
 *  @param  {Entity|Operation}   obj  - either entity or operation being added
 *  @return {this}                      this, for chaining
 */
Query.prototype.add = function(name, obj) {
    if (typeof name !== 'string') {
        throw new FluxModelingError('name: string expected');
    }
    if (utilities.isEntity(obj)) {
        if (this.entities[name] !== undefined)
            throw new FluxModelingError('entity "' + name + '" already defined');
        this.entities[name] = obj;
    } else if (obj.isOperation) {
        this.operations.push(new OpSlot(name, obj));
    } else if (Array.isArray(obj)) { // Raw operation
        this.add(name, Operation.raw(obj));
    } else {
        throw new FluxModelingError('obj: either Entity or Operation is expected');
    }
    return this;
};
