/** @file Helper functions and classes to generate valid JSON queries to Geometry Worker server.
 *  Use {@link scene} as a starting point
 *  @author Igor Baidiuk <ibaidiuk@amcbridge.com>
 */

/* jslint node:true */

/***************************************************************************************************
 *  Constructs new instance for current module
 */
function constructModule(config) {
"use strict";
/***************************************************************************************************
 *  Configuration part
 */
var flux = require('./index');
config = config || {};
if (typeof config !== 'object') {
    throw new FluxModelingError("config: expected object");
}

// Skip require for environments that don't support it (rollup)
if (!config.skip) {
    var flux = require('./index');

    // Functions are used for defaults - because of modules' lazy load process
    var schema = 'schema' in config ? config['schema'] : flux.schemas.pbw;
    // If a user of modelingjs is explicitly passing a falsey value for genId,
    // then default to a function that returns undefined, to avoid errors attempting
    // to call a null value downstream.
    var genId =  config['genId'] ||  function () { return undefined; };

    var convertUnits = (function () {
        var registry = 'registry' in config ? config['registry'] : new flux.measure.Registry();
        return registry
            ? registry.ConvertUnits.bind(registry)
            : function (obj, dimUnits) { return obj; };
    })();
}

var eps = 1e-8;

/* Generate uuid, that will be used as geometry id
    By default, this generates undefined. Users who want to generate id's should
    explicitly override the exported property on this module.
 */

/* Converts any array-like object to actual array
   Used mostly with Arguments objects
 */

var DEFAULT_LINEAR_TOLERANCE = 0.1;
var DEFAULT_ANGULAR_SIZE     = 30.0;

function toArray(obj) {
    return Array.prototype.slice.call(obj);
}

function notImplemented() {
    throw new FluxModelingError('not implemented');
}

function normalize(arr) {
    var m = Math.sqrt(arr[0]*arr[0] + arr[1]*arr[1]  + arr[2]*arr[2]);
    return [arr[0]/m, arr[1]/m, arr[2]/m];
}

function xor(l, r) { return l ? !r : r; }
// Common dump function, returns text representation
// check for both null and undefined
function isNone(value) { return value === null || value === undefined; }

function isInst(value, type) {
    if (!(type instanceof Function))
        throw new FluxModelingError('type: constructor expected');
    if (isNone(value))
        return false;
    return (value instanceof type) || value.constructor == type;
}
// Inherit one type from another, adding methods via prototype object
function inherit(clazz, base, proto) {
    clazz.prototype = Object.create(base.prototype);
    clazz.prototype.constructor = clazz;
    if (proto)
        Object.keys(proto).forEach(
            function (key) {
                clazz.prototype[key] = proto[key];
            }
        );
}

function initObject(dest, source) {
    if (typeof source !== "object")
        throw new Error("source: expected object");
    if (typeof dest !== "object")
        throw new Error("dest: expected object");
    for (var key in source)
        dest[key] = source[key];
}

function mapObject(source, lambda) {
    if (typeof source !== "object")
        throw new Error("source: expected object");
    if (typeof lambda !== "function")
        throw new Error("lambda: expected object");

    var dest = {};
    for (var key in source)
        dest[key] = lambda(key, source[key]);
    return dest;
}

//******************************************************************************
// Resolver becoming kind of scope stuff

var queryResolver = function () { return undefined; };

function resolve(item) {
    return queryResolver(item);
}

function withResolver(resolver, lambda) {
    var prev = queryResolver;
    queryResolver = resolver;
    try {
        return lambda();
    }
    finally {
        queryResolver = prev;
    }
}

//******************************************************************************
// Type declarations
//******************************************************************************
/** Use factory function {@link query}
 *  @class
 *  @classdesc Represents block query as query, with geometrical entities and operations over there
 */
function Query() {
    this.entities   = {};
    this.operations = [];

    var counter = 1;
    this.generateName = function (prefix) {
        var name = prefix + '@' + counter;
        counter += 1;
        return name;
    };
}
/** Creates new query object
 *
 *  @return {Query} new empty query object
 */
var query = function () { return new Query(); };
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
/* Resolves Entity or Operation object into its name in query
   Entities without a name are assigned with autogenerated name
   Operations without a name return no name and thus expanded in-place

   @param  {Entity|Operation} object - to be resolved
   @param  {number}           index  - index of current operation block, used to block forward lookups
   @return {string}                    item name, if any
 */
function resolveItem(self, e, opIndex) {
    var key;
    if (e instanceof Entity) {
        Object.keys(self.entities).forEach(function (k) {
            if (!key && self.entities[k] === e) {
                key = k;
            }
        });
        if (!key) {
            key = self.generateName(e.primitive);
            self.entities[key] = e;
        }
        return key;
    }
    else if (e instanceof Operation) {
        var ops = self.operations;
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


function dumpOperations(self) {
    function resolver(index) {
        return function(e) { return resolveItem(self, e, index); };
    }

    return self.operations.map(
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

/*  @class
    @classdesc Named operation slot
 */
function OpSlot(name, op) {
    this.name = name;
    this.operation = op;
}
OpSlot.prototype.toJSON = function () {
    return {
        name: this.name,
        op:   this.operation.toJSON()
    };
};

/** Adds entity/operation to query
 *
 *  @param  {string}             name - name of item being added
 *  @param  {Entity|Operation}   obj  - either entity or operation being added
 *  @return {this}                      this, for chaining
 */
Query.prototype.add = function(name, obj) {
    if (typeof name !== 'string')
        throw new FluxModelingError('name: string expected');
    if (obj instanceof Entity) {
        if (this.entities[name] !== undefined)
            throw new FluxModelingError('entity "' + name + '" already defined');
        this.entities[name] = obj;
    }
    else if (obj instanceof Operation) {
        this.operations.push(new OpSlot(name, obj));
    }
    else if (obj.primitive !== undefined) {
        this.add(name, entities.raw(obj));
    }
    else if (Array.isArray(obj)) { // Raw operation
        this.add(name, operations.raw(obj));
    }
    else
        throw new FluxModelingError('obj: either Entity or Operation is expected');
    return this;
};

//******************************************************************************
/** Use factory function {@link dcmScene}
 *  @class
 *  @classdesc Represents block query as scene, with geometrical entities, constraints, variables, equations and operations over there
 */
function DCMScene() {
    this.entities   = {};
    this.constraints = {};
    this.variables = {};
    this.equations = {};
    this.operations = [];
}

// Adds array of elements to scene
DCMScene.prototype.addMultiple = function (elements) {
    for (var key in elements)
        this.add(elements[key], key);
};

/** Creates new scene object
 *  @param  {Object} value - optional, object with entities, constraints, etc.., to initialize scene
 *
 *  @return {DCMScene} new scene object
 */
var dcmScene = function (value) {
    var scene = new DCMScene();
    if (value) {
        for (var key in value)
            scene.addMultiple(value[key]);
    }

    return scene;
};
/** Converts DCMScene object to JSON representation
 *  Adds custom-conversion support for {@link JSON.stringify}
 *
 *  @return {*} JSON-ready object
 */
DCMScene.prototype.toJSON  = function () {
    var ops  = dumpDCMOperations(this);
    return {
        Entities:       this.entities,
        Constraints:    this.constraints,
        Variables:      this.variables,
        Equations:      this.equations,
        Operations:     ops
    };
};

/* Resolves Entity, Constraint, Variable, Equation or Operation object into its name in query
   Entities, Constraints, Variables and Equations without a name are assigned with guid
   Operations without a name return no name and thus expanded in-place

   @param  {Entity|Constraint|Variable|Equation|Operation}  object to be resolved
   @param  {number}                                         index of current operation block, used to block forward lookups
   @return {string}                                         item name, if any
 */
function resolveDCMItem(self, e, opIndex) {
    var key;
    if (e instanceof Entity) {
        Object.keys(self.entities).forEach(function (k) {
            if (!key && self.entities[k] === e) {
                key = k;
            }
        });
        if (!key) {
            key = e.id || genId();
            self.entities[key] = e;
        }
    }
    else if (e instanceof Operation) {
        var ops = self.operations;
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
    }
    return key;
}

function dumpDCMOperations(self) {
    function resolver(index) {
        return function (e) { return resolveDCMItem(self, e, index); };
    }

    return self.operations.map(
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

DCMScene.prototype.hasEntity = function (name) {
    return name in this.entities;
};

DCMScene.prototype.hasConstraint = function (name) {
    return name in this.constraints;
};

DCMScene.prototype.hasVariable = function (name) {
    return name in this.variables;
};

DCMScene.prototype.hasEquation = function (name) {
    return name in this.equations;
};

// Helper function. Switches all ids in entity fields to new guids
function updateEntityIds (elem) {
    if (elem) {
        var idFields = ['startId', 'endId', 'originId'];
        idFields.forEach(function(field){
            if (elem.hasOwnProperty(field)) {
                elem[field] = genId();
            }
        });

        // 'id' field is obligatory
        elem.id = genId();
    }

    return elem;
}

DCMScene.prototype.updateEntity = function (old) {
    var name = old.id;
    if (!this.hasEntity(name))
        throw new FluxModelingError("Entity " + name + " is not present in scene");
    var e = this.entities[name];
    updateEntityIds(e);
    return e;
};

// Generates entities related to given one (e.g. end points
// of the line), adds them and entity itself to scene
DCMScene.prototype.addEntity = function(entity, name) {
    var self = this;
    var initId = function (name, value) {
        var nameId = name + 'Id';
        var valueId = entity[nameId];
        if (!self.hasEntity(valueId))
            self.addEntity(
                entities.point(value || entity[name], valueId),
                valueId
            );
    }

    switch (entity.primitive)
    {
        case 'point':
        case 'curve':
            // Entity is self-sufficient, so need to add only entity itself
            break;
        case 'line':
            initId('start');
            initId('end');
            break;
        case 'circle':
        case 'ellipse':
            initId('origin');
            break;
        case 'arc':
            initId('origin', getCircleCenterByThreePoints(entity.start, entity.middle, entity.end));
            initId('start');
            initId('end');
            break;
        case 'polyline':
        case 'polycurve':
            notImplemented(); // TODO Implement after polyline
            break;
        default:
            throw new FluxModelingError("Entity with primitive " + entity.primitive + " can not be added to scene");
    }

    this.entities[name] = entity;
};
/** Adds entity/constraint/variable/equation/operation to scene
 *
 *  @param          obj  - either entity, constraint, variable, equation or operation being added
 *  @param {string} name - name of item being added
 *  @return              - this object, for chain of calls
 */
DCMScene.prototype.add = function(obj, name) {
    name = name || obj.id;
    if (!isInst(name, String))
        throw new FluxModelingError('name: string expected');
    if (isInst(obj, Entity)) {
        if (!this.hasEntity(name))
            this.addEntity(obj, name);
    }
    else if (isInst(obj, Constraint)) {
        if (this.hasConstraint(name))
            throw new FluxModelingError('constraint "' + name + '" already defined');
        this.constraints[name] = obj;
    }
    else if (isInst(obj, Variable)) {
        if (this.hasVariable(name))
            throw new FluxModelingError('variable "' + name + '" already defined');
        this.variables[name] = obj;
    }
    else if (isInst(obj, Equation)) {
        if (this.hasEquation(name))
            throw new FluxModelingError('equation "' + name + '" already defined');
        this.equations[name] = obj;
    }
    else if (obj.primitive !== undefined) {
        if (!this.hasEntity(name))
            this.addEntity(entities.raw(obj), name);
    }
    else if (obj.type !== undefined) {
        if (this.hasConstraint(name))
            throw new FluxModelingError('constraint "' + name + '" already defined');
        this.constraints[name] = constraints.raw(obj);
    }
    else if (obj.name !== undefined && obj.value !== undefined) {
        throw new FluxModelingError('Adding raw variable is not supported');
    }
    else if (obj.equation !== undefined) {
        throw new FluxModelingError('Adding raw equation is not supported');
    }
    else if (isInst(obj, Operation)) {
        this.operations.push(new OpSlot(name, obj));
    }
    else
        throw new FluxModelingError('obj: either Entity, Constraint, Variable, Equation or Operation is expected');
    return this;
};

//******************************************************************************
/** Use functions from {@link entities} to construct
 *  @class
 *  @classdesc Represents entity in Flux protocol. These objects are added to the 'Entities' part of scene
 */
function Entity(id) { this.primitive = id; }

/** Add attribute to entity
 *  If first argument is a string, it's treated as attribute type,
 *  and second argument is treated as attribute value.
 *  Otherwise, first argument is treated as full attribute object.
 *  Its type key is retrieved via type() method,
 *  and the whole object is used as attribute value.
 *  See {@link attributes} for known attribute types
 *
 *  @param  {*|string} objkey  - either attribute key (string) or full attribute object (*)
 *  @param  {*}        [value] - raw attribute value
 *  @return {this}               this, for chaining
 */
Entity.prototype.addAttribute = function(keyobj, value) {
    var key;
    if (typeof(keyobj) === "string")
        key = keyobj;
    else
    {
        key = keyobj.type();
        value = keyobj;
    }

    if (!this.attributes)
        this.attributes = {};
    if (key in this.attributes)
        throw new FluxModelingError("attribute of type '" + key + "' already defined");
    this.attributes[key] = value;
    return this;
};
//******************************************************************************/
// Pseudo-classes representing entity categories

/**
 *  @class
 *  @extends Entity
 *  @classdesc Represents any limited embodied geometry
 */
function Body() { Entity.apply(this, arguments); }
// Inherit Body from Entity
inherit(Body, Entity,
/** @lends Body.prototype */
{
    /** Adds axis vector to the body
    *   @param {number[]|Vector} a - axis vector
    *   @return {this}               this, for chaining
    */
    setAxis: function (a) {
        this.axis = vecCoords(a);
        return this;
    },
    /** Adds reference vector to the body
    *   @param {number[]|Vector} ref - reference vector
    *   @return {this}                 this, for chaining
    */
    setReference: function (ref) {
        this.reference = vecCoords(ref);
        return this;
    }
});
/**
 *  @class
 *  @extends Body
 *  @classdesc Represents 3D point
 */
function Point() { Body.apply(this, arguments); }
inherit(Point, Body);
/**
 *  @class
 *  @extends Body
 *  @classdesc Wire entities, i.e. polylines, curves, ellipses
 */
function Wire() { Body.apply(this, arguments); }
inherit(Wire, Body);
/**
 *  @class
 *  @extends Body
 *  @classdesc Sheet entities, i.e. polygon sets, surfaces
 */
function Sheet() { Body.apply(this, arguments); }
inherit(Sheet, Body);
/**
 *  @class
 *  @extends Body
 *  @classdesc Solid entities, i.e. meshes, spheres, boxes
 */
function Solid() { Body.apply(this, arguments); }
inherit(Solid, Body);
/**
 *  @class
 *  @extends Body
 *  @classdesc General bodies; can be received only as a result of some operation
 */
function General() { Body.apply(this, arguments); }
inherit(General, Body);

/**
 *  @class
 *  @extends Entity
 *  @classdesc Analytical geometry entities
 */
function Geometry() { Entity.apply(this, arguments); }
inherit(Geometry, Entity);
/**
 *  @class
 *  @extends Geometry
 *  @classdesc Infinite plane
 */
function Plane() { Geometry.apply(this, arguments); }
inherit(Plane, Geometry);
/**
 *  @class
 *  @extends Geometry
 *  @classdesc 3D direction vector
 */
function Vector() { Geometry.apply(this, arguments); }
inherit(Vector, Geometry);


function parsePath(s) {
    if(s[0] !== "#") {
        throw "Expected paths similar to #/foo/bar/baz";
    }
    s = s.substr(2);
    return s.split("/");
}

function getSubSchema(refPath) {
    var components = parsePath(refPath);
    var s = schema;
    for (var i = 0; i < components.length; i++) {
        var sub = s[components[i]];
        s = sub;
    }
    return s;
}

function recurseToDimension(subSchema) {
    if (subSchema === undefined) {
        return undefined;
    }
    if (subSchema.$ref !== undefined) {
        return recurseToDimension(getSubSchema(subSchema.$ref));
    }
    if (subSchema.oneOf !== undefined) {
        return recurseToDimension(subSchema.oneOf[0]);
    }
    switch(subSchema.type) {
        // As our units-of-measurement schema does not index into arrays,
        // assume that all items in each array have the same dimension.
        case "array":
            return recurseToDimension(subSchema.items);
        case "number":
            return subSchema.fluxDimension;
        // We swallow any sub-objects that might ahve further
        // case "object":
    }
    return undefined;
}

/** Looks up field to dimension mapping for entity types.
 * This is a very limited implementation that only supports units scoped a
 * single-field deep, and does not support indexing into composite entities
 * (eg, polycurve and polysurface). It does work for the existing set of
 * entities as described in psworker.json, but extensions to that may require
 * revisiting this implementation.
 *
 *  @param  {string}    typeid  - name of entity type, value for 'primitive' property
 *  @return {object}            - map from field to dimension
 */
function lookupFieldDimensions(typeid) {
    if (!schema)
        return {};
    var subSchema = schema.entities[typeid];

    var results = {};
    for (var key in subSchema.properties) {
        var d = recurseToDimension(subSchema.properties[key]);
        if (d !== undefined) {
            results[key] = d;
        }
    }
    return results;
}


// TODO(andrew): consdier setting these at a per-project level, rather than
// hardcoding them.
var _defaultDimToUnits = {
    "length":"meters",
    "area":"meters*meters",
    "volume":"meters*meters*meters",
    "angle":"degrees"
};


/** Looks up default field units
 *
 *  @param  {string}    typeid  - name of entity type, value for 'primitive' property
 *  @return {object}            - map from field to unit, appropriate for setting
 *                                as the "units" field of an entity.
 */
function defaultUnits(typeid) {
    var dimensions = lookupFieldDimensions(typeid);
    var results;
    for (var key in dimensions) {
        if (results === undefined) {
            results = {};
        }
        results[key] = _defaultDimToUnits[dimensions[key]];
    }
    return results;
}

/** Determines whether or not an entity has units information attached
 *
 *  @param  {object}    entity  - name of entity type, value for 'primitive' property
 *  @return {object}            - map from field to unit, appropriate for setting
 *                                as the "units" field of an entity.
 */
function detectUnits(entity) {
    // If units are defined, return true
    if (entity.units) {
        return true;
    }

    // Brep entities have implicit units.
    if (entity.primitive == "brep") {
        return true;
    }

    // For polycurve and polysurface entities, loop through subentities;
    if (entity.primitive == "polycurve") {
        for (var i = 0; i < entity.curves.length; i++) {
            if (detectUnits(entity.curves[i])) {
                return true;
            }
        }
    }
    if (entity.primitive == "polysurface") {
        for (var j = 0; j < entity.surfaces.length; j++) {
            if (detectUnits(entity.surfaces[j])) {
                return true;
            }
        }
    }

    return false;
}


/** Helper function

    @private
    @param  {string}   typeid  - name of entity type, value for 'primitive' property
    @param  {any}      params  - additional parameters of entity
    @param  {function} OptCtor - optional, constructor function; {@link Entity} if undefined
    @return {Entity}             Entity or any other type specified by OptCtor
*/
function primitive(typeid, params, OptCtor) {
    OptCtor = OptCtor || Entity;
    var e = new OptCtor(typeid);
    initObject(e, params);
    e.primitive = typeid;
    e.units = defaultUnits(typeid);
    return e;
}
/** Helper function to extract point coordinates

    @private
    @param  {any}   obj  - entity or array
    @param  {string} dimToUnits - optional, desired units of resulting
        vector. Only used if the input object is an entity, and if this module
        has been init'd with a units of measure registry.
    @return {Array}             Coordinate array
*/
function makeAdjustCoords(type, primitive, field) {
    return function coords(obj, dimToUnits) {
        if (Array.isArray(obj))
            return obj;

        if (obj !== undefined) {
            if (obj.primitive === primitive) {
                dimToUnits = dimToUnits || _defaultDimToUnits;

                // Only perform the conversion if the units
                // do not already match the desired units.
                if (obj.units && obj.units[field] != dimToUnits.length) {
                    obj = convertUnits(obj, dimToUnits);
                }
                return obj[field];
            }
        }
        throw new FluxModelingError("expected array of numbers or " + type.name + " entity");
    };
}

var coords = makeAdjustCoords(Point, "point", "point");

function mapCoords(vec) {
    var out = [];
    for (var i = 0, e = vec.length; i < e; ++i)
        out.push(coords(vec[i]));
    return out;
}

/** Helper function to extract vector components

    @private
    @param  {any}   obj  - entity or array
    @param  {string} dimToUnits - optional, desired units of resulting
        vector. Only used if the input object is an entity, and if this module
        has been init'd with a units of measure registry.
    @return {Array}             Component array
*/

var vecCoords = makeAdjustCoords(Vector, "vector", "coords");

function mapVecCoords(vec) {
    var out = [];
    for (var i = 0, e = vec.length; i < e; ++i)
        out.push(vecCoords(vec[i]));
    return out;
}

// Multiply 2 matrices
function multMatrix(a, b) {
    var len = a.length;

    var c = new Array(len);
    var i;

    var dim = Math.sqrt(len);

    for (i = 0; i < dim; ++i)
        for (var j = 0; j < dim; ++j) {
            var s = 0;
            for (var k = 0 ; k < dim; ++k)
                s += a[i * dim + k] * b[k * dim + j];
            c[i * dim + j] = s;
        }
    return c;
}
// Applies additional affine transform by pre-multiplying
function applyMatrix(self, m) {
    self.mat = multMatrix(m, self.mat);
    return self;
}

/** Use {@link entities.affine} to construct
 *  @class
 *  @extends Entity
 *  @classdesc Entity which represents affine transformation matrix
 */
function Affine() { Entity.apply(this, arguments); }
// Inherit Affine from Entity
inherit(Affine, Entity,
/** @lends Affine.prototype */
{
    /** Adds 3D translation
     *  @param  {number[]|Vector} delta - translation vector
     *  @return {this}                    this, for chaining
     */
    translate: function (d) {
        d = vecCoords(d);
        return applyMatrix(this, [
             1,  0,  0, d[0],
             0,  1,  0, d[1],
             0,  0,  1, d[2],
             0,  0,  0,  1
        ]);
    },
    /** Adds 3D rotation around X axis
     *  @param  {number} phi - rotation angle, in degrees
     *  @return {this}         this, for chaining
     */
    rotateX: function (phi) {
        phi = phi * Math.PI / 180;
        var sin = Math.sin(phi), cos = Math.cos(phi);
        return applyMatrix(this, [
             1,    0,    0, 0,
             0,  cos,  sin, 0,
             0, -sin,  cos, 0,
             0,    0,    0, 1
        ]);
    },
    /** Adds 3D rotation around Y axis
     *  @param  {number} phi - rotation angle, in degrees
     *  @return {this}         this, for chaining
     */
    rotateY: function (phi) {
        phi = phi * Math.PI / 180;
        var sin = Math.sin(phi), cos = Math.cos(phi);
        return applyMatrix(this, [
              cos, 0, -sin, 0,
                0, 1,    0, 0,
              sin, 0,  cos, 0,
                0, 0,    0, 1
        ]);
    },
    /** Adds 3D rotation around Z axis
     *  @param  {number} phi - rotation angle, in degrees
     *  @return {this}         this, for chaining
     */
    rotateZ: function (phi) {
        phi = phi * Math.PI / 180;
        var sin = Math.sin(phi), cos = Math.cos(phi);
        return applyMatrix(this, [
              cos,  sin, 0, 0,
             -sin,  cos, 0, 0,
                0,    0, 1, 0,
                0,    0, 0, 1
        ]);
    },
    /** Adds 3D scaling
     *  @param  {number[]|Vector} scale - scaling vector
     *  @return {this}                    this, for chaining
     */
    scale: function(s) {
        s = vecCoords(s);
        return applyMatrix(this, [
             s[0],  0,   0,  0,
               0, s[1],  0,  0,
               0,   0, s[2], 0,
               0,   0,   0,  1
        ]);
    },
    /** Rotate around arbitrary vector
     *  @param  {number[]|Vector} axis - rotation axis
     *  @param  {number}          phi  - rotation angle, in degrees
     *  @return {this}                   this, for chaining
     */
    rotateAboutAxis: function (a, phi) {
        phi = phi * Math.PI / 180;
        var sin = Math.sin(phi), cos = Math.cos(phi);
        a = vecCoords(a);
        a = normalize(a);
        var x = a[0], y = a[1], z = a[2];
        return applyMatrix(this, [
            cos+x*x*(1-cos),    x*y*(1-cos)-z*sin, y*sin+x*z*(1-cos),  0,
            z*sin+x*y*(1-cos),  cos+y*y*(1-cos),   -x*sin+y*z*(1-cos), 0,
            -y*sin+x*z*(1-cos), x*sin+y*z*(1-cos), cos+z*z*(1-cos),    0,
            0,                  0,                 0,                  1
        ]);
    },
    /** Reflect against specified plane
     *  @param  {number[]|Point} normal - plane's normal vector
     *  @param  {number[]|Point} origin - in-plane point
     *  @return {this}        this, for chaining
     */
    reflect: function (n, p) {
        n = vecCoords(n);
        p = coords(p);
        var nx = n[0], ny = n[1], nz = n[2],
            px = p[0], py = p[1], pz = p[2];

        var len = Math.sqrt(nx*nx + ny*ny + nz*nz);
        nx /= len; ny /= len; nz /= len;

        var d = -nx * px - ny * py - nz * pz;

        return applyMatrix(this, [
            1.0 - 2 * nx * nx,  -2 * nx * ny,       -2 * nx * nz,       -2 * nx * d,
            -2 * nx * ny,       1.0 - 2 * ny * ny,  -2 * ny * nz,       -2 * ny * d,
            -2 * nx * nz,       -2 * ny * nz,       1.0 - 2 * nz * nz,  -2 * nz * d,
            0,                  0,                  0,                  1
        ]);
    },

    /** Compose with another transformation
     *  @param {affine} t - transformation to compose with.
     */
     compose: function (t) {
        return applyMatrix(this, t.mat);
     }
});

/** Use {@link entities.polygonSet} to construct
 *  @class
 *  @extends Sheet
 *  @classdesc Entity which represents set of polygons
 */
function PolygonSet() { Sheet.apply(this, arguments); }
// inherit PolygonSet from Entity
inherit(PolygonSet, Sheet,
/** @lends PolygonSet.prototype */
{
    /** Adds new outer boundary loop polygon to set
     *
     *  @function
     *  @param  {...(number[]|Point)} points - a set of points representing polygon
     *  @return {this}                 this, for chaining
     */
    addBoundary: function () { // add polygon to set
        this.polygons.push({
            boundary: mapCoords(arguments),
            holes: []
        });
        return this;
    },
    /** Adds inner hole loop to the last polygon in a set
     *
     *  @function
     *  @param  {...(number[]|Point)} points - a set of points representing hole
     *  @return {this}                 this, for chaining
     */
    addHole: function() { // add hole to last polygon
        var polys = this.polygons;
        var last = polys[polys.length - 1];
        last.holes.push(mapCoords(arguments));
        return this;
    }
});
/** Use {@link entities.mesh} to construct
 *  @class
 *  @extends Solid
 *  @classdesc Entity which represents 3D polygonal mesh
 */
function Mesh() { Solid.apply(this, arguments); }
// inherit Mesh from Entity
inherit(Mesh, Solid,
/** @lends Mesh.prototype */
{
    /** Adds vertex to mesh
     *
     *  @function
     *  @param  {number[]|Point} coords
     *  @return {this}           this, for chaining
     */
    addVertex: function (c) {
        this.vertices.push(coords(c));
        return this;
    },
    /** Adds multiple vertices to mesh
     *
     *  @function
     *  @param  {(number[]|Point)[]} coords
     *  @return {this}               this, for chaining
     */
    addVertices: function () {
        for (var i = 0; i < arguments.length; ++i)
            this.addVertex(arguments[i]);
        return this;
    },
    /** Builds new face in mesh from vertex indices
     *
     *  @function
     *  @param  {...number} index - indices of vertices constituting face
     *  @return {this}              this, for chaining
     */
    addFace: function() {
        this.faces.push(toArray(arguments));
        return this;
    },
    /** Adds multiple faces to mesh composed of vertex indices
     *
     *  @function
     *  @param  {...number} index - indices of vertices constituting face
     *  @return {this}              this, for chaining
     */
    addFaces: function() {
        for (var i = 0; i < arguments.length; ++i)
            this.faces.push(arguments[i])
        return this;
    }
});

function appendToField(field) {
    return function() {
        var self = this;
        toArray(arguments).forEach(function (i) {
            self[field].push(i);
        });
        return this;
    };
}
// Transforms incoming data item to 'canonical' weighted vertex form
// Canonical form is a 2-element array, with first element being 3-element array with point coordinates
// and second being either weight noumber or 'undefined'
//
// Supported forms are:
// 1. 3-number array  - unweighted
// 2. 4-number array  - weighted
// 3. Point           - unweighted
// 4. [Point]         - unweighted
// 5. [Point, number] - weighted
// 6. Point.toJSON()  - unweighted
function canonicVertex(item) {
    if (Array.isArray(item)) {       // one of array cases
        if (item.length == 1)
            // repr #4 - unpack single array element and try to treat it as item
            return canonicVertex(item[0]);
        if (item.length == 2)
            // repr #5
            return [coords(item[0]), item[1]];
        if (item.length == 3)
            // repr #1
            return [item, undefined];
        if (item.length == 4)
            // repr #2
            return [item.slice(0, 3), item[3]];
    }
    else if (item instanceof Point || item.primitive == "point") // Point case
        // repr #3, #6
        return [coords(item), undefined];
    // Didn't match anything, so just throw
    throw new FluxModelingError("Unsupported vertex representation");
}

function appendVertex(ctxt, item) {
    item = canonicVertex(item);
    var pt = item[0], w = item[1];

    if (ctxt.weights === undefined) {
        if (w !== undefined) {
            if (ctxt.points.length === 0)
                ctxt.weights = [ w ];
            else
                throw new FluxModelingError('Cannot add weighted vertex because previous vertices were weightless');
        }
        ctxt.points.push(pt);
    }
    else {
        if (w === undefined)
            throw new FluxModelingError('Vertex must have weight specified');
        ctxt.weights.push(w);
        ctxt.points.push(pt);
    }
    // NB: case where points are empty, and weights are not, isn't an error - because weights are in a linear array, and points aren't always
}

/** Use {@link entities.curve} to construct
 *  @class
 *  @extends Wire
 *  @classdesc Entity which represents NURBS curve
 */
function Curve() { Wire.apply(this, arguments); }
// inherit Curve from Wire
inherit(Curve, Wire,
/** @lends Curve.prototype */
{
    /** Appends numbers to array of knots
     *
     *  @function
     *  @param  {...number} knot - knot values
     *  @return {this}             this, for chaining
     */
    addKnots:  appendToField('knots'),
    /** Adds curve vertex, either weighted or weightless
     *
     *  Weightless vertices are specified in one of the following formats:
     *  - 3 numbers
     *  - 1 Point
     *  - array of 3 numbers
     *  Weighted vertices are specified in one of the following formats:
     *  - 4 numbers
     *  - 1 Point, 1 number
     *  - array of 3 numbers, 1 number
     *  Also, any of these sets of arguments can be passed as a single argument, packed into array
     *  @function
     *  @return {this}                      this, for chaining
     */
    addVertex: function () {
        var ctxt = { points: this.controlPoints, weights: this.weights };
        appendVertex(ctxt, toArray(arguments));
        this.controlPoints = ctxt.points;
        this.weights       = ctxt.weights;
        return this;
    },
    /** Adds multiple vertices to curve, passed argv style

     */
    addVertices: function () {
        for (var i = 0; i < arguments.length; ++i)
            this.addVertex.apply(this, Array.isArray(arguments[i]) ? arguments[i] : [ arguments[i] ])
        return this;
    }
});

/** Use {@link entities.surface} to construct
 *  @class
 *  @extends Sheet
 *  @classdesc Entity which represents NURBS surface
 */
function Surface() { Sheet.apply(this, arguments); }
// inherit Surface from Sheet
inherit(Surface, Sheet,
/** @lends Surface.prototype */
{
    /** Appends numbers to array of U-axis knots
     *
     *  @function
     *  @param  {...number} knot - knot values
     *  @return {this}             this, for chaining
     */
    addUKnots: appendToField('uKnots'),
    /** Appends numbers to array of V-axis knots
     *
     *  @function
     *  @param  {...number} knot - knot values
     *  @return {this}             this, for chaining
     */
    addVKnots: appendToField('vKnots'),
    /** Appends separate row (along surface's U axis) of control points to surface
     *
     *  @function
     *  @param  {...any} point - control points; for supported point representations, see {@link Curve#vertex}, except each vertex is passed as a single argument
     *  @return {this}           this, for chaining
     */
    addRow: function() {
        var ctxt = { points: [], weights: this.weights };

        for (var i = 0, e = arguments.length; i < e; ++i)
            appendVertex(ctxt, toArray(arguments[i]));

        this.controlPoints.push(ctxt.points);
        this.weights = ctxt.weights;
        return this;
    },
    /** Appends multiple rows of control points to surface
     *
     *  @function
     *  @param  {...any[]} row - rows of control points; see {@link Surface#row} for exact row structure
     *  @return {this}           this, for chaining
     */
    addPoints: function() {
        for (var i = 0, e = arguments.length; i < e; ++i)
            this.addRow.apply(this, arguments[i]);
        return this;
    }
});

//******************************************************************************
/** Use functions from {@link constraints} to construct
 *  @class
 *  @classdesc Represents constraint in Flux protocol. These objects are added to the 'Constraints' part of scene
 */
function Constraint(id) { this.type = id; }

/** Helper function

    @private
    @param  {string}   typeid  - name of constraint type, value for 'type' property
    @param  {any}      params  - additional parameters of constraint
    @return {Constraint}         Constraint
*/
function type(typeid, params) {
    var e = new Constraint(typeid);
    initObject(e, params);
    e.type = typeid;
    e.id = genId();
    return e;
}

//******************************************************************************
/** Use functions from {@link variables} to construct
 *  @class
 *  @classdesc Represents variable in Flux protocol. These objects are added to the 'Variables' part of scene
 */
function Variable() {}

/** Helper function

    @private
    @param  {any}      params - parameters of variable
    @return {Variable}          Variable
*/
function variable(params) {
    var v = new Variable();
    initObject(v, params);
    v.id = genId();
    return v;
}

//******************************************************************************
/** Use functions from {@link equations} to construct
 *  @class
 *  @classdesc Represents equation in Flux protocol. These objects are added to the 'Equations' part of scene
 */
function Equation() {}

/** Helper function

    @private
    @param  {any}      params - parameters of equation
    @return {Equation}          Equation
*/
function equation(params) {
    var e = new Equation();
    initObject(e, params);
    e.id = genId();
    return e;
}

//******************************************************************************
/** Use functions from {@link operations} to construct
 *  @class
 *  @classdesc Encapsulates info about operation in DCM/Parasolid Worker protocol
 */
function Operation(id) {
    this.opcode = id;
}
/** Converts operation body to JSON
    Adds support for {@link JSON.stringify}

    @return {*} JSON-ready object
 */
Operation.prototype.toJSON = function () {
    var r = (this.args || []).map(function (item) {
        if (item instanceof Operation)
            return resolve(item) || item.toJSON();
        if (item instanceof Entity) { // locate bound entity by name
            var entity = resolve(item);
            if (!entity)
                throw Error("Failed to resolve entity");
            return entity;
        }
        if (item.primitive !== undefined) {
            var entity = resolve(entities.raw(item));
            if (!entity)
                throw Error("Failed to resolve entity-like object");
            return entity;
        }

        return item;
    });
    r.unshift(this.opcode);
    return r;
};
// Helper, generates operation factory
function op(id, nargs) {
    return function() {
        var r = new Operation(id);
        r.args = toArray(arguments).slice(0, nargs);
        return r;
    };
}
//******************************************************************************
// Attributes
//******************************************************************************

/** Use {@link attributes.material} to construct
 *  @class
 *  @classdesc Material attribute
 */
function Material() { }
/** @lends Material.prototype */
Material.prototype = {
    constructor: Material,
    /** Returns "material" for attribute type name
     *  @return {string} "material"
     */
    type: function() { return "material"; },
    /** Converts material to JSON object. Adds support for {@link JSON.stringify}
     *  @return {*} JSON-ready object
     */
    toJSON: function() {
        return {
            ambient:  this.ambient,
            diffuse:  this.diffuse,
            specular: this.specular,
            power:    this.power
        };
    },
    /** Sets ambient, diffuse and specular color values
     *
     *  @function
     *  @param  {number} - red
     *  @param  {number} - green
     *  @param  {number} - blue
     *  @return {this}     this, for chaining
     */
    setColor: function (r, g, b) {
        return this.setAmbient(r, g, b).setDiffuse(r, g, b).setSpecular(r, g, b).setPower(1);
    },
    /** Sets ambient color
     *
     *  @function
     *  @param  {number} - red
     *  @param  {number} - green
     *  @param  {number} - blue
     *  @return {this}     this, for chaining
     */
    setAmbient: function (r, g, b) {
        this.ambient = [r, g, b];
        return this;
    },
    /** Sets specular color
     *
     *  @function
     *  @param  {number} - red
     *  @param  {number} - green
     *  @param  {number} - blue
     *  @return {this}     this, for chaining
     */
    setSpecular: function (r, g, b) {
        this.specular = [r, g, b];
        return this;
    },
    /** Sets diffuse color
     *
     *  @function
     *  @param  {number} - red
     *  @param  {number} - green
     *  @param  {number} - blue
     *  @return {this}     this, for chaining
     */
    setDiffuse: function (r, g, b) {
        this.diffuse = [r, g, b];
        return this;
    },
    /** Sets specular power
     *
     *  @function
     *  @param  {number} power
     *  @return {this}   this, for chaining
     */
    setPower: function (s) {
        this.power = s;
        return this;
    }
};

var attributes =
/** Attribute constructors.
 *  Attributes are added to entities via {@link Entity#attribute Entity.addAttribute}
 *  @namespace attributes
 */
{
    /** Constructs material attribute
     *  @function
     *  @return {Material}
     */
    material: function () { return new Material(); }
};

/** Sets entity attribute on either a list of entities, raw object or instance of entity.
 *
 *  @function
 *  @param  {entity} entity - entity to modify
 *  @param  {string} property   - property
  *  @param  {*} value   - value
 *  @return {*}                 - entity with attribute set
 */
var setEntityAttribute = function(entity, property, value) {
    if (Array.isArray(entity)) {
        return entity.map(function(elt) {
            setEntityAttribute(elt, property, value);
        });
    }
    if (!(entity instanceof Entity))
        entity = entities.raw(entity);

    return entity.addAttribute(property, value);
};

/** Gets entity attribute on either raw object or instance of entity.
 *
 *  @function
 *  @param  {Entity} entity - entity to query
 *  @param  {string} property   - property
 *  @return {*}                 - attribute value
 */
var getEntityAttribute = function(entity, property) {
    if (Array.isArray(entity)) {
        return entity.map(function(elt) {
            getEntityAttribute(elt, property);
        });
    }
    return (entity.attributes || {})[property];
};

//******************************************************************************
// Utilities
//******************************************************************************
var utilities = {
    coords:coords,
    vecCoords:vecCoords,
    setEntityAttribute: setEntityAttribute,
    getEntityAttribute: getEntityAttribute,
    defaultUnits: defaultUnits,
    detectUnits: detectUnits,
    lookupFieldDimensions: lookupFieldDimensions
};

//******************************************************************************
// Entities
//******************************************************************************
// var entities is used for self-call
var entities =
/** Entity constructors
 *  @namespace entities
 */
{
    //******************************************************************************
    // Raw entity, specified directly as JSON
    //******************************************************************************
    /** Constructs entity object from raw data. No checks for primitive value, body being object etc.
     *
     *  @param  {*}      body - any JavaScript value
     *  @return {Entity}
     */
    raw: function(body) {
        var e = new Entity(body.primitive);
        initObject(e, body);
        return e;
    },

    //******************************************************************************
    // Vector entity
    //******************************************************************************

    /** Constructs Vector entity
     *
     *  @function
     *  @param  {number[]|Vector} coords - vector coordinates
     *  @return {Vector}
     */
    vector: function (vec) {
        return primitive('vector', { coords: vecCoords(vec) }, Vector);
    },

    //******************************************************************************
    // Point entity
    //******************************************************************************

    /** Constructs point entity
     *
     *  @function
     *  @param  {number[]|Point} coords - array with point coordinates
     *  @param  {string}         name   - optional, entity id
     *  @return {Point}
     */
    point: function (pt, name) {
        return primitive('point', {
            point: coords(pt),
            id: name || genId()
        }, Point);
    },

    //******************************************************************************
    // Wire entities
    //******************************************************************************

    /** Constructs line entity
     *
     *  @function
     *  @param  {number[]|Point} start - starting point
     *  @param  {number[]|Point} end   - end point
     *  @param  {string}         name  - optional, entity id
     *  @return {Wire}          line entity
     */
    line: function (start, end, name) {
        return primitive('line', {
            start:   coords(start),
            end:     coords(end),
            startId: start.id || genId(),
            endId:   end.id || genId(),
            id:      name || genId()
        }, Wire);
    },
    /** Constructs polyline entity
     *
     *  @function
     *  @param  {...number[]|Point} point - a set of points forming polyline
     *  @return {Wire}                      polyline entity
     */
    polyline: function() {
        return primitive('polyline', {
            points: mapCoords(arguments)
        }, Wire);
    },
    /** Constructs arc entity
     *
     *  @function
     *  @param  {number[]|Point}    start  - start point
     *  @param  {number[]|Point}    middle - middle point
     *  @param  {number[]|Point}    end    - end point
     *  @param  {string}            name   - optional, entity id
     *  @return {Wire}              arc entity
     */
    arc: function (start, middle, end, name) {
        return primitive('arc', {
            start:    coords(start),
            middle:   coords(middle),
            end:      coords(end),
            startId:  start.id || genId(),
            endId:    end.id || genId(),
            originId: genId(),
            id:       name || genId()
        }, Wire);
    },
    /** Constructs NURBS curve entity
     *
     *  @function
     *  @param  {number} degree - curve's NURBS degree
     *  @param  {string} name   - optional, entity id
     *  @return {Curve}           curve entity
     */
    curve: function(degree, name) {
        return primitive('curve', {
            degree: degree,
            knots: [],
            controlPoints: [],
            id: name || genId()
        },
        Curve);
    },
    /** Constructs circle entity
     *
     *  @function
     *  @param  {number[]|Point}    center - circle center
     *  @param  {number}            r      - radius
     *  @param  {string}            name   - optional, entity id
     *  @return {Wire}            circle entity
     */
    circle: function (center, r, name) {
        return primitive('circle', {
            origin:   coords(center),
            originId: center.id || genId(),
            radius:   r,
            id:       name || genId()
        },
        Wire);
    },
    /** Constructs ellipse entity
     *
     *  @function
     *  @param  {number[]|Point}  center
     *  @param  {number}          rMajor - major radius
     *  @param  {number}          rMinor - minor radius
     *  @param  {number[]|Vector} dir    - major direction
     *  @param  {string}          name   - optional, entity id
     *  @return {Wire}
     */
    ellipse: function (center, rMajor, rMinor, dir, name) {
        return primitive('ellipse', {
            origin:      coords(center),
            originId:    center.id || genId(),
            majorRadius: rMajor,
            minorRadius: rMinor,
            direction:   (dir ? vecCoords(dir) : undefined),
            id:          name || genId()
        },
        Wire);
    },
    /** Constructs rectangle entity
     *
     *  @function
     *  @param  {number[]|Point}  center
     *  @param  {number[]|Vector} span - length of the rectangle along its local x and y axes
     *  @return {Wire}
     */
    rectangle: function (center, span) {
        var c = vecCoords(span);
        if (c.length != 2) {
            throw new FluxModelingError("Expected rectangle dimensions to be 2-dimensional.");
        }
        return primitive('rectangle', { origin: coords(center), dimensions: c }, Wire);
    },
    /** Constructs polycurve entity
     *
     *  Polycurve may represent any wire body, including non-manifold and disjoint
     *
     *  @function
     *  @param  {Wire[]}  curves
     *  @return {Wire}
     */
    polycurve: function (curves) {
        return primitive('polycurve', { curves: curves }, Wire);
    },

    //******************************************************************************
    // Sheet entities
    //******************************************************************************

    /** Constructs polygon set
     *
     *  @function
     *  @return {PolygonSet} polygon set entity
     */
    polygonSet: function () {
        return primitive('polygonSet', { polygons: [] }, PolygonSet);
    },
    /** Constructs NURBS surface
     *
     *  @function
     *  @param  {number}  uDegree - NURBS degree along U parameter
     *  @param  {number}  vDegree - NURBS degree along V parameter
     *  @return {Surface}           NURBS surface entity
     */
    surface: function(uDegree, vDegree) {
        return primitive('surface', {
            uDegree: uDegree,
            vDegree: vDegree,
            uKnots: [],
            vKnots: [],
            controlPoints: []
        }, Surface);
    },
    /** Constructs polysurface entity
     *
     *  Polysurface may represent any sheet or solid body, including non-manifold and disjoint
     *
     *  @function
     *  @param  {Sheet[]}  surfaces
     *  @return {Sheet}
     */
    polysurface: function (surfaces) {
        return primitive('polysurface', { surfaces: surfaces }, Sheet);
    },

    //******************************************************************************
    // Solid entities
    //******************************************************************************

    /** Constructs 3D mesh
     *
     *  @function
     *  @return {Mesh} mesh entity
     */
    mesh: function () {
        return primitive('mesh', { vertices: [], faces: [] }, Mesh);
    },
    /** Constructs 3D solid block
     *
     *  @function
     *  @param  {number[]|Point}  center
     *  @param  {number[]|Vector} dimensions - block dimensions along axes
     *  @return {Solid}
     */
    block: function (center, span) {
        return primitive('block', { origin: coords(center), dimensions: vecCoords(span) }, Solid);
    },

    /** Constructs sphere
     *
     *  @function
     *  @param  {number[]|Point} center
     *  @param  {number}         radius
     *  @return {Solid}
     */
    sphere: function (c, r) {
        return primitive('sphere', { origin: coords(c), radius: r }, Solid);
    },

    //******************************************************************************
    // Other entities
    //******************************************************************************
    /** Constructs affine transformation matrix
     *
     *  @function
     *  @param  {number[]} [matrix] - initial matrix, default is identity matrix
     *  @return {Affine}              affine transformation matrix entity
     */
    affine: function (optMatrix) {
        optMatrix = optMatrix || [
             1, 0, 0, 0 ,
             0, 1, 0, 0 ,
             0, 0, 1, 0 ,
             0, 0, 0, 1
        ];
        return primitive('affineTransform', { mat: optMatrix }, Affine);
    },
    /** Constructs infinite plane
     *
     *  @function
     *  @param  {number[]|Point}  origin - in-plane point
     *  @param  {number[]|Vector} normal - plane's normal vector
     *  @return {Plane}
     */
    plane: function (o, n) {
        return primitive('plane', {
            origin: coords(o),
            normal: vecCoords(n)
        });
    }
};

//******************************************************************************
// Constraints
//******************************************************************************
// Helper functions to create json constraints
function constr1(e) {
    return { entity1: e.id };
}
function valueConstr1(val, e) {
    return { value: val, entity1: e.id };
}
function constr2(e1, e2) {
    return { entity1: e1.id, entity2: e2.id };
}
function valueConstr2(val, e1, e2) {
    return { value: val, entity1: e1.id, entity2: e2.id };
}
function helpConstr2(e1, e2, h1, h2) {
    return { entity1: e1.id, entity2: e2.id, help1: h1, help2: h2 };
}
function helpParamsConstr2(e1, e2, p1, p2) {
    return { entity1: e1.id, entity2: e2.id, helpParam1: p1, helpParam2: p2 };
}
function valueHelpConstr2(val, e1, e2, h1, h2) {
    return { value: val, entity1: e1.id, entity2: e2.id, help1: h1, help2: h2 };
}
function constr3(e1, e2, e3) {
    return { entity1: e1.id, entity2: e2.id, entity3: e3.id };
}
function help(param) {
    if (arguments.length !== 1)
        throw new FluxModelingError("Invalid help parameter " + JSON.stringify(arguments));
    if (Array.isArray(param)) {
        if(param.length !== 0 && param.length !== 3) {
            throw new FluxModelingError("Invalid help point " + JSON.stringify(param));
        }
        return param;
    }
    if (typeof param !== 'number')
        throw new FluxModelingError("Invalid help parameter " + JSON.stringify(param));
    return [param];
}
// var constraints is used for self-call
var constraints =
    /** Constraint constructors
    *  @namespace constraints
    */
{
    //******************************************************************************
    // Raw constraint, specified directly as JSON
    //******************************************************************************
    /** Constructs constraint object from raw data. No checks for type value, body being object etc.
     *
     *  @param  {*}      body - any JavaScript value
     *  @return {Constraint}
     */
    raw: function(body) {
        var c = new Constraint(body.type);
        initObject(c, body);
        return c;
    },
    /** Constructs parallel constraint
     *  Defined only for geometries with a direction
     *  It implies that the directions of the geometries are parallel
     *
     *  @function
     *  @param  {Entity} e1     - first entity
     *  @param  {Entity} e2     - second entity
     *  @return {Constraint}      parallel constraint
     */
    parallel: function(e1, e2) {
        return type('parallel', constr2(e1, e2));
    },
    /** Constructs radius constraint
     *  Defined only for circles
     *
     *  @function
     *  @param  {Entity} val    - circle radius value
     *  @param  {Entity} e      - circle entity
     *  @return {Constraint}      radius constraint
     */
    radius: function(val, e) {
        return type('radius', valueConstr1(val, e));
    }
};
// Operations
//******************************************************************************
var ops =
/** Operation constructors
 *  This documentation isn't precise on argument and result types,
 *  because functions listed here effectively create operation objects.
 *  So functions here are documented in terms of types
 *  these operations require as arguments and produce as results.
 *  Due to operation nesting and use of direct string identifiers,
 *  each of these functions can receive {@link string}, {@link Operation}
 *  along with types listed in parameter description.
 *  And each of these functions produces {@link Operation} object.
 *  @namespace operations
 */
{
    /** identity pseudo-operation
     *  Returns its single argument
     *  Used in cases where some entity should be directly mapped to output
     *
     *  @function
     *  @param  {Entity} entry - any entity
     *  @return {Entity}       - entry, unchanged
     */
    identity: function(entry) {
        var r = new Operation('identity');
        r.args = [entry];
        r.toJSON = function () {
            return Operation.prototype.toJSON.call(this)[1];
        };
        return r;
    },
    /** 'list' operation
     *  Accepts arbitrary list of entity/operation arguments
     *  @function
     *  @param  {...Entity} arg - any entity or operation
     *  @return {Entity[]}        list of entities
     */
    list: function() {
        var r = new Operation('list');
        r.args = toArray(arguments);
        return r;
    },
    /** 'repr' operation
     *  Produces Brep object in desired format.
     *  "content" field, which contains actual data, may be zip-packed and base64 encoded
     *  You cannot enable compression and disable base64-coding
     *  Format identifiers supported:
     *  - "x_b":  Parasolid binary format
     *  - "x_t":  Parasolid textual format
     *  - "iges": IGES format
     *  - "step": STEP
     *  - "sat":  SAT
     *  @function
     *  @param  {string}                    format identifier
     *  @param  {Entity}                    entity which should be converted to BREP
     *  @param  {boolean} [is_compressed] - compress content data stream or not, default false
     *  @param  {boolean} [is_base64]     - encode content data stream as base-64 or not, default true
     *  @return {Entity}  BREP
     */
    repr: op('repr', 4),
    /** 'raw' operation
     *  Accepts operation name and variadic list of its arguments directly
     *  Use with caution, only when you know what you do
     *  @function
     *  @param  {string}    name - operation identifier
     *  @param  {...Entity} arg  - any entity or operation
     *  @return {Entity[]}         list of entities
     */
    raw: function() {
        var r = new Operation(arguments[0]);
        r.args = toArray(arguments).slice(1);
        return r;
    },
    /** 'union' operation
     *  Computes union of two geometries
     *  @function
     *  @param  {Sheet|Solid} left
     *  @param  {Sheet|Solid} right
     *  @return {Mesh}        union result
     */
    unite: op('union', 2),
    /** 'intersection' operation
     *  Computes intersection of two geometries
     *  @function
     *  @param  {Sheet|Solid} left
     *  @param  {Sheet|Solid} right
     *  @return {Mesh}        intersection result
     */
    intersect: op('intersection', 2),
    /** 'difference' operation
     *  Subtracts right geometry from the left one
     *  @function
     *  @param  {Sheet|Solid} left  - entity to subtract from
     *  @param  {Sheet|Solid} right - entity being subtracted from left
     *  @return {Mesh}                subtraction result
     */
    subtract: op('difference', 2),
    /** 'evalDist' operation
     *  Computes distance between two geometries
     *  @function
     *  @param  {Point|Wire|Sheet|Solid} left
     *  @param  {Point|Wire|Sheet|Solid} right
     *  @return {number}                 distance between entities
     */
    evalDist: op('evalDist', 2),
    /** 'transform' operation
     *  Transforms 3D entity using affine matrix
     *  @function
     *  @param  {Point|Wire|Sheet|Solid} entity          - entity to transform
     *  @param  {Affine}                 transformation  - 3D affine matrix
     *  @return {Point|Wire|Sheet|Solid}                   first argument, transformed
     */
    transform: op('transform', 2),
    /** 'evalMassProps' operation
     *  Computes mass properties of entity
     *
     *  @function
     *  @param  {Wire|Sheet|Solid} entity
     *  @return {MassProps}        mass properties; not defined in this module because cannot be used as query input
     */
    evalMassProps: op('evalMassProps', 1),
    /** 'trim' operation
     *  Trims surface with a curve
     *  @function
     *  @param  {Sheet} sheet - sheet to be trimmed
     *  @param  {Wire}  curve - closed curve which will trim surface (will be projected onto surface if not resides on it)
     *  @return {Sheet}         trimmed sheet
     */
    trim: op('trim', 2),
    /** 'crossSection' operation
     *  Sections solid or sheet body with surface
     *  The result is a piece of surface which forms section
     *  @function
     *  @param  {Solid|Sheet} body    - solid or sheet body to section
     *  @param  {Plane}       surface - plane or cylinder surface to section with
     *  @return {Sheet}                 resulting cross-section
     */
    crossSection: op('crossSection', 2),
    /** 'extractSheetBoundary' operation
     *  Extracts a sheet body's boundary as a wire body.
     *  @function
     *  @param  {Sheet}       body    - sheet body to extract boundary of
     *  @return {Sheet}                 resulting boundary
    */
     extractSheetBoundary: op('extractSheetBoundary', 1),
    /** 'intersectBodyWithLine' operation
     *  Computes a list of points where line intersects faces of specified body
     *  Points are ordered by their position on the line, along line's main direction
     *  @function
     *  @param  {Sheet|Solid} body - solid or sheet body to intersect
     *  @param  {Wire}        line - intersection line
     *  @return {Point[]}            list of intersection points
     */
    intersectBodyWithLine: op('intersectBodyWithLine', 2),
    /** 'extrude' operation
     *  Extrudes body along direction, until second body is reached
     *  @function
     *  @param  {Point|Wire|Sheet} profile   - extruded profile
     *  @param  {Sheet|Solid}      bound     - bounding body
     *  @param  {Vector}           direction - extrusion direction
     *  @return {Mesh}
     */
    extrude: op('extrude', 3),
    /** 'extrudeWithDistance' operation
     *  Extrudes body along direction for a specified distance
     *  @function
     *  @param  {Point|Wire|Sheet} body      - extruded profile
     *  @param  {number}           distance  - 'height' of extrusion
     *  @param  {Vector}           direction - extrusion direction
     *  @return {Mesh}
     */
    extrudeWithDistance: op('extrudeWithDistance', 3),
    /** 'sweep' operation
     *  Sweeps wire or sheet profile along guide wire
     *  @function
     *  @param  {Wire[]|Sheet[]} profiles - profiles being swept
     *  @param  {Wire[]}         guides   - guide wires to sweep along
     *  @return {Mesh}
     */
    sweep: op('sweep', 2),
    /** 'loft' operation
     *  Lofts a set of profiles along a set of guide wires
     *  @function
     *  @param  {Wire[]|Sheet[]} profiles      - lofted profiles
     *  @param  {Wire[]}         guides        - lofting guides
     *  @param  {Point[]}        startVertices - starting vertices for lofted profiles
     *  @return {Mesh}
     */
    loft: op('loft', 3),
    /** 'revolve' operation
     *  Spins specified profile around axis based at origin for a specified angle
     *  @function
     *  @param  {Point|Wire|Sheet} profile - spinned profile
     *  @param  {Point}            origin  - rotation center
     *  @param  {Vector}           axis    - rotation axis, which is normal vector to rotation plane
     *  @param  {number}           angle   - spinning angle
     *  @return {Mesh}
     */
    revolve: op('revolve', 4),
    /** 'evalCurveLength' operation
     *  Computes curve length
     *  @function
     *  @param  {Curve}  curve
     *  @return {number}
     */
    evalCurveLength: op('evalCurveLength', 1),
    /** 'tessellate' operation
     *  Converts BREP body to a polygonal mesh
     *  @function
     *  @param  {Solid}    body              - body being tessellated
     *  @param  {number}  [linearTolearance] - the minimum linear size of any detail to be visible
     *  @param  {number}  [angularSize]      - the angle, in degrees, which provided body occupies in field of view
     *  @return {Mesh}
     */
    tesselate: function() {
        var r = new Operation('tessellate');
        r.args = [ arguments[0], arguments[1] || DEFAULT_LINEAR_TOLERANCE, arguments[2] || DEFAULT_ANGULAR_SIZE ];
        return r;
    },
    /** 'tesselateStl' operation
     *  Constructs STL representation of specified BREP
     *  @function
     *  @param  {Body}    body      - body being tessellated
     *  @param  {number}  quality   - tesselation quality, ranges 0-4; the bigger, the better
     *  @return {Entity}  BREP
     */
    tessellateStl: op('tessellateStl', 2),
    /** 'tesselateJson' operation
     *  Constructs JSON representation of specified BREP
     *  @function
     *  @param  {Body}    body      - body being tessellated
     *  @param  {number}  quality   - tesselation quality, ranges 0-4; the bigger, the better
     *  @param  {number}  units     - desired units for result given in terms of relative size of 1 meter
     *  @return {Entity}  BREP
     */
    tessellateJson: op('tessellateJson', 3),
    /** 'createPolylineApprox' operation
     *  Converts NURBS curve to polyline
     *  @function
     *  @param  {Curve}     curve
     *  @return {Point[]}
     */
    createPolylineApprox: op('createPolylineApprox', 1),
    /** 'mirror' operation
     *  Produces entity that reflected about given origin and direction
     *  @function
     *  @param  {Point|Wire|Sheet|Solid} body
     *  @param  {Point}                  origin
     *  @param  {Vector}                 direction
     *  @return {Point|Wire|Sheet|Solid}
     */
    mirror: op('mirror', 3),
    /** 'createLinearPattern' operation
     *  Produces linear pattern of entity in the given direction
     *  that is separated by spacing parameter
     *  @function
     *  @param  {Point|Wire|Sheet|Solid}  pattern
     *  @param  {Vector}                  direction
     *  @param  {number}                  spacing   - distance between pattern copies
     *  @param  {number}                  nEntities - repetitions count
     *  @return {Point|Wire|Sheet|Solid}
     */
    createLinearPattern: op('createLinearPattern', 4),
    /** 'createCircularPattern' operation
     *  Produces circular pattern of entity in the given direction
     *  that is separated by angle between each instance
     *  @function
     *  @param  {Point|Wire|Sheet|Solid}  pattern
     *  @param  {Point}                   origin
     *  @param  {Vector}                  direction - direction vector in which to create patterns
     *  @param  {number}                  angle     - angle between instances
     *  @param  {number}                  nEntities - repetitions count
     *  @return {Point|Wire|Sheet|Solid}
     */
    createCircularPattern: op('createCircularPattern', 5),
    /** 'createPlanarSheet' operation
     *  Creates a sheet body from a closed curve
     *  @function
     *  @param  {Wire}  curve - closed curve
     *  @return {Sheet}
     */
    createPlanarSheet: op('createPlanarSheet', 1),
     /** 'sectionBody' operation
     *  Sections a body with a plane or a sheet
     *  @function
     *  @param  {Sheet|Solid} target
     *  @param  {Sheet|Plane} tool
     *  @return {Sheet|Solid} the piece of original body from 'back' tool side (opposite to where tool's normal points)
     */
    sectionBody: op('sectionBody', 2),
    /** 'joinCurves' operation
     *  Joins a closed set of wires to form a solitary wire
     *  @function
     *  @param  {...Wire} wire
     *  @return {Wire}
     */
    joinCurves: op('joinCurves', 1),
    /** 'evalCurve' operation
     *  Evaluates a point and derivatives at a given curve parameter
     *  For b-curves, the parameter space is bound by the lowest and highest value in the knot vector.
     *  For other wires parameter spaces are preset as follows:
     *   - Line      - [0, 1]
     *   - Polyline  - [0, 1]
     *   - Rectangle - [0, 1]
     *   - Arc       - [0, 1]
     *   - Circle    - [0, 2Pi]
     *   - Ellipse   - [0, 2Pi]
     *  Circles and ellipses are always periodic, so it is possible to pass values beyond this interval.
     *  @function
     *  @param  {Curve}   curve
     *  @param  {number}  t       - parameter on curve
     *  @param  {number}  nDerivs - number of derivatives
     *  @return {Point[]}           a point and N derivatives
     */
    evalCurve: op('evalCurve', 3),
    /** 'evalSurface' operation
     *  Evaluates a point and derivatives at a given surface parameter pair
     *  @function
     *  @param  {Sheet}   surface
     *  @param  {number}  u        - surface parameter
     *  @param  {number}  v        - surface parameter
     *  @param  {number}  nUDerivs - derivatives count along U parameter
     *  @param  {number}  nVDerivs - derivatives count along V parameter
     *  @return {Point[]}            result point and its nU*nV-1 derivatives
     */
    evalSurface: op('evalSurface', 5),
    /** 'makeSubCurve' operation
     *  Creates a curve based on an existing curve's parameter interval
     *  For b-curves, the parameter space is bound by the lowest and highest value in the knot vector.
     *  For other wires parameter spaces are preset as follows:
     *   - Line      - [0, 1]
     *   - Polyline  - [0, 1]
     *   - Rectangle - [0, 1]
     *   - Arc       - [0, 1]
     *   - Circle    - [0, 2Pi]
     *   - Ellipse   - [0, 2Pi]
     *  Circles and ellipses are always periodic, so it is possible to pass values beyond this interval.
     *  @function
     *  @param  {Curve}  curve
     *  @param  {number} t0    - subrange start
     *  @param  {number} t1    - subrange end
     *  @return {Curve}          sub-curve from t0 to t1
     */
    makeSubCurve: op('makeSubCurve', 3),
    /** 'makeSubSurface' operation
     *  Creates a sub-surface based on an existing surface's parameter box
     *  @function
     *  @param  {Sheet}  surface
     *  @param  {number} u0 - U subrange start
     *  @param  {number} u1 - U subrange end
     *  @param  {number} v0 - V subrange start
     *  @param  {number} v1 - V subrange end
     *  @return {Sheet}       sub-sheet in ([u0, u1], [v0, v1]) box
     */
    makeSubSurface: op('makeSubSurface', 5),
    /** 'intersectCurves' operation
     *  Finds all intersections between two curves
     *  @function
     *  @param  {Curve}   curve1
     *  @param  {Curve}   curve2
     *  @return {Point[]} intersections list
     */
    intersectCurves: op('intersectCurves', 2),
    /** 'offsetBody' operation
     *  'Bloats' sheet or solid body by offsetting all its faces by specified distance, using faces' normals as directions
     *  @function
     *  @param  {Sheet|Solid} body
     *  @param  {number}      distance
     *  @return {Sheet|Solid}
     */
    offsetBody: op('offsetBody', 2),
    /** 'offsetWire' operation
     *  'Bloats' planar wire body by offsetting its pieces by specified distance
     *  @function
     *  @param  {Wire}   wire     - wire, must lie in one plane
     *  @param  {number} distance - distance to offset
     *  @param  {Vector} normal   - normal to wire's plane
     *  @return {Wire}
     */
    offsetWire: op('offsetWire', 3),
    /** 'createProfiles' operation
     *  Creates a wire or sheet body from a set of wires
     *  @function
     *  @param  {Wire[]}     profiles
     *  @param  {number}     sheetFlag - 0 for wire result, otherwise sheet
     *  @return {Wire|Sheet}             cannot be exported, only usable as input for other operations
     */
    createProfiles: op('createProfiles', 2),
    /** 'compareCurves' operation
     *  Checks if two NURBS curves are equal
     *  Following wires are considered NURBS geometry: lines, polylines, arcs, curves, rectangles.
     *  Returns "1" if wires have equal knots, points and degrees, "0" otherwise.
     *  @function
     *  @param  {Curve}   curve1
     *  @param  {Curve}   curve2
     *  @return {Number}  "1" if equal, "0" otherwise
     */
    compareCurves: op('compareCurves', 2),
    /** 'createResilientProfiles' operation
     *  Creates profiles which inner loops are removed
     *  @function
     *  @param  {Wire[]}  profiles
     *  @return {Sheet}   profile
     */
    createResilientProfiles: op('createResilientProfiles', 1),
    /** 'eval' operation
     *  Evaluates entire scene inside DCM-Worker
     *  @function
     *  @return {DCM/Scene} scene
     */
    eval: function() {
        return new Operation('eval');
    },
    /** 'evalBoundingBox' operation
     *  Calculates axis-aligned bounding box of an array of entities
     *  @function
     *  @param  {Point|Wire|Sheet|Solid[]} entities
     *  @return {Point[]} minimum and maximum points of the bounding box
     */
    evalBoundingBox: op('evalBoundingBox', 1),
    /** 'getBodyInfo' operation
     *  Returns body type and other info of an entity
     *  @function
     *  @param  {Point|Wire|Sheet|Solid} body
     *  @return {BodyInfo} info
     */
    getBodyInfo: op('getBodyInfo', 1)
};

// Helper function
function getCircleCenterByThreePoints(start, middle, end)
{
    // All z-coords are taken to be 0
    // Not valid for real 3d arc

    var offset = Math.pow(middle[0], 2) + Math.pow(middle[1], 2);
    var bc = (Math.pow(start[0], 2) + Math.pow(start[1], 2) - offset) / 2.0;
    var cd = (offset - Math.pow(end[0], 2) - Math.pow(end[1], 2)) / 2.0;
    var det = (start[0] - middle[0]) * (middle[1] - end[1]) - (middle[0] - end[0]) * (start[1] - middle[1]);
    if (Math.abs(det) < eps) {
        throw new FluxModelingError("Cannot get circle center by three points [" +
            start[0] + ", " + start[1] + "], [" + middle[0] + ", " +
            middle[1] + "], [" + end[0] + ", " + end[1] + "]");
    }
    var idet = 1.0/det;

    var centerX =  (bc * (middle[1] - end[1]) - cd * (start[1] - middle[1])) * idet;
    var centerY =  (cd * (start[0] - middle[0]) - bc * (middle[0] - end[0])) * idet;

    return [centerX, centerY, 0.0];
}

function FluxModelingError(message) {
            this.name = 'FluxModelingError';
            this.message = message || 'Invalid or degenerate geometry specified.';
            this.stack = (new Error()).stack;
        }
FluxModelingError.prototype = Object.create(Error.prototype);
FluxModelingError.prototype.constructor = FluxModelingError;

return {
    query:      query,
    dcmScene:   dcmScene,
    attributes: attributes,
    utilities:  utilities,
    entities:   entities,
    constraints: constraints,
    operations: ops
};

}

/**
    Module exports factory function, which itself constructs module instance
    Factory accepts optional configuration object. If config object is absent,
    it's treated as empty one. If config property is set, its value is used;
    otherwiase, default is used. Please note that "property in object" is used,
    instead of "object.property !== undefined", which allows to distinguish
    config options set to undefined explicitly.

    To disable a related piece of functionality, pass null or undefined in
    the configuration parameters.

    Config options available:
    - schema - parsed JSON schema object, used for validation purposes; default '<index>.schemas.pbw'
    - registry - UoM registry, used for units conversion; default 'new <index>.measure.Registry()'
    - genId - UUID generator function; default '<index>.uuid.v4'
 */
module.exports = constructModule;
