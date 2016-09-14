'use strict';
import UoM from '../lib/measure_inner.js';

// Helper functions
function toMapStringInt(components) {
    var ret = new UoM.MapStringInt();
    try {
        for(var key in components) {
            ret.set(key, components[key]);
        }
    }
    catch(ex) {
        ret.delete();
        throw ex;
    }

    return ret;
}

function unitComponentsToDictionary(components) {
    var ret = {};
    for(var i = 0; i < components.units.size(); ++i) {
        ret[components.units.get(i)] = components.powers.get(i);
    }
    return ret;
}

function dimensionComponentsToDictionary(components) {
    var ret = {};
    for(var i = 0; i < components.dimensions.size(); ++i) {
        ret[components.dimensions.get(i)] = components.powers.get(i);
    }
    return ret;
}

// Registry encapsulates a set of dimensions, a set of units,
// and the conversion functions that link units of the same dimension.
// Registry provides functionality for validating and matching units & dimensions,
// and for building conversion functions between scalars denoted in
// different sets of units. Registry has predefined
// set of standard units and conversions.
export function Registry() {
    this.impl = UoM.NewStandardRegistry();
}

// Clear should be called to properly destroy Registry inner resources
Registry.prototype.Clear = function() {
    UoM.DeleteRegistry(this.impl);
};

// AddConcreteDimension defines a new primitive dimension.
Registry.prototype.AddConcreteDimension = function(dimension) {
    var err = UoM.AddConcreteDimension(this.impl, dimension);
    if(err.ok != true)
        throw new Error(err.err);
};

// A composite Dimension (eg, area) is really shorthand for some other set
// of component dimensions (area : length * length, etc).
Registry.prototype.AddCompositeDimension = function(dim, components) {
    var comps = toMapStringInt(components);
    try {
        var err = UoM.AddCompositeDimension(this.impl, dim, comps);
        if(err.ok != true)
            throw new Error(err.err);
    }
    finally {
        comps.delete();
    }
};

// AddUnit defines a unit and provides it's dimension.
Registry.prototype.AddUnit = function(unit, dim, aliases) {
    var als = new UoM.VectorString();
    try {
        for(var i = 0; i < aliases.length; ++i) {
            als.push_back(aliases[i]);
        }
        var err = UoM.AddUnit(this.impl, unit, dim, als);
        if(err.ok != true)
            throw new Error(err.err);
    }
    finally {
        als.delete();
    }
};

Registry.prototype.AddScaledRelationship = function(fromUnit, toUnit, scale) {
    var err = UoM.AddScaledRelationship(this.impl, fromUnit, toUnit, scale);
    if(err.ok != true)
        throw new Error(err.err);
};

Registry.prototype.AddAffineRelationship = function(fromUnit, toUnit, scale, offset) {
    var err = UoM.AddAffineRelationship(this.impl, fromUnit, toUnit, scale, offset);
    if(err.ok != true)
        throw new Error(err.err);
};

// Handles checks that units' components are well defined.
Registry.prototype.Handles = function(components) {
    var comps = toMapStringInt(components);
    try {
        var err = UoM.Handles(this.impl, comps);
        if(err.ok != true)
            throw new Error(err.err);
    }
    finally {
        comps.delete();
    }
};

// Determine whether a given set of units match dimensions.
// Each pair of quantities passed into 'convert' should be verified with
// DimensionsMatch beforehand.
Registry.prototype.DimensionsMatch = function(left, right) {
    var match = false;
    var lComps = toMapStringInt(left);
    try {
        var rComps = toMapStringInt(right);
        try {
            var bt = UoM.DimensionsMatch(this.impl, lComps, rComps);
            if(bt.ok != true)
                throw new Error(bt.err);
            match = bt.value;
        }
        finally {
            rComps.delete();
        }
    }
    finally {
        lComps.delete();
    }

    return match;
};

// ToCanonical strips out aliased units. This does not check for unit validity.
Registry.prototype.ToCanonical = function(units) {
    var ret = {};
    var comps = toMapStringInt(units);
    try {
        var result = UoM.ToCanonical(this.impl, comps);
        try {
            if(result.ok != true)
                throw new Error(result.err);
            ret = unitComponentsToDictionary(result);
        }
        finally {
            result.units.delete();
            result.powers.delete();
        }
    }
    finally {
        comps.delete();
    }

    return ret;
};

// ToDimension transforms a unit components into the corresponding dimension components
Registry.prototype.ToDimension = function(units) {
    var ret = {};
    var comps = toMapStringInt(units);
    try {
        var result = UoM.ToDimension(this.impl, comps);
        try {
            if(result.ok != true)
                throw new Error(result.err);
            ret = dimensionComponentsToDictionary(result);
        }
        finally {
            result.dimensions.delete();
            result.powers.delete();
        }
    }
    finally {
        comps.delete();
    }

    return ret;
};

Registry.prototype.DefinesUnit = function(unit) {
    var bt = UoM.DefinesUnit(this.impl, unit);
    if(bt.ok != true)
        throw new Error(bt.err);
    return bt.value;
};

Registry.prototype.DefinesDimension = function(dim) {
    var bt = UoM.DefinesDimension(this.impl, dim);
    if(bt.ok != true)
        throw new Error(bt.err);
    return bt.value;
};

Registry.prototype.IsCompositeDimension = function(dim) {
    var bt = UoM.IsCompositeDimension(this.impl, dim);
    if(bt.ok != true)
        throw new Error(bt.err);
    return bt.value;
};

// Convert given value from quantities in one set of units to another.
Registry.prototype.Convert = function(fromUnits, toUnits, value) {
    var ret = 0.0;
    var from = toMapStringInt(fromUnits);
    try {
        var to = toMapStringInt(toUnits);
        try {
            var result = UoM.Convert(this.impl, from, to, value);
            if(result.ok != true)
                throw new Error(result.err);
            ret = result.value;
        }
        finally {
            to.delete();
        }
    }
    finally {
        from.delete();
    }

    return ret;
};

// Convert units in jsonData using rules in dimToUnitsJson.
// Returns new json with replaced units and values.
// E.g. jsonData:
// {
//     "units":{
//         "/foo":"km",
//         "/bar":"cm"
//     },
//     "foo":1.0,
//     "bar":100
// }
// dimToUnitsJson:
// {
//     "length":"meters"
// }
Registry.prototype.ConvertUnits = function(jsonData, dimToUnitsJson) {
    var data = (typeof(jsonData) == "object") ? JSON.stringify(jsonData) : jsonData;
    var dimToUnits = (typeof(dimToUnitsJson) == "object") ? JSON.stringify(dimToUnitsJson) : dimToUnitsJson;
    var result = UoM.ConvertUnits(data, dimToUnits, this.impl);
    if(result.ok != true)
        throw new Error(result.err);
    return JSON.parse(result.str);
};

// Parses a string that of the format 'u1*u2*u3/u4'
export function ParseUnits(units) {
    var comps = UoM.ParseUnits(units);
    try {
        if(comps.ok != true)
            throw new Error(comps.err);
        return unitComponentsToDictionary(comps);
    }
    finally {
        comps.units.delete();
        comps.powers.delete();
    }
}


/** Determines whether or not an entity has units information attached
 *
 *  @param  {object}    entity  name of entity type, value for 'primitive' property
 *  @return {object}            map from field to unit, appropriate for setting
 *                              as the "units" field of an entity.
 */
export function detectUnits(entity) {
    // If units are defined, return true
    if (entity.units) {
        return true;
    }

    // Brep entities have implicit units.
    if (entity.primitive === "brep") {
        return true;
    }

    // For polycurve and polysurface entities, loop through subentities;
    if (entity.primitive === "polycurve") {
        for (var i = 0; i < entity.curves.length; i++) {
            if (detectUnits(entity.curves[i])) {
                return true;
            }
        }
    }
    if (entity.primitive === "polysurface") {
        for (var j = 0; j < entity.surfaces.length; j++) {
            if (detectUnits(entity.surfaces[j])) {
                return true;
            }
        }
    }

    return false;
}
