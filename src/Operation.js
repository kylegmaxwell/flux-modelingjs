'use strict';

import * as utilities from './utilities.js';
import { resolve } from './resolver.js';

/* Converts any array-like object to actual array
   Used mostly with Arguments objects
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj);
}

/** Use functions below to construct
 * @class Operation
 * @classdesc Encapsulates info about operation in DCM/Parasolid Worker protocol
 * @param {string} id The operation identifier
 */
export default function Operation(id) {
    this.opcode = id;
    // This property is used to check whether the instance is a member of the class
    this.isOperation = true;
}

/** Converts operation body to JSON
    Adds support for {@link JSON.stringify}

    @return {*} JSON-ready object
 */
Operation.prototype.toJSON = function () {
    var r = (this.args || []).map(function (item) {
        if (item instanceof Operation)
            return resolve(item) || item.toJSON();
        if (utilities.isEntity(item)) {
            var entity = resolve(item);
            if (!entity)
                throw Error("Failed to resolve entity object");
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
        var args = toArray(arguments);
        if (args.length != nargs) {
            throw new Error("Expected "+nargs+ "arguments", "got "+args.length);
        }
        r.args = args.slice(0, nargs);
        return r;
    };
}

/** Operation constructors
 *  This documentation isn't precise on argument and result types,
 *  because functions listed here effectively create operation objects.
 *  So functions here are documented in terms of types
 *  these operations require as arguments and produce as results.
 *  Due to operation nesting and use of direct string identifiers,
 *  each of these functions can receive {@link string}, {@link Operation}
 *  along with types listed in parameter description.
 *  And each of these functions produces {@link Operation} object.
 */

/** identity pseudo-operation
 *  Returns its single argument
 *  Used in cases where some entity should be directly mapped to output
 *
 *  @function
 *  @param  {Entity} entry any entity
 *  @return {Entity}       entry, unchanged
 */
Operation.identity = function(entry) {
    var r = new Operation('identity');
    r.args = [entry];
    r.toJSON = function () {
        return Operation.prototype.toJSON.call(this)[1];
    };
    return r;
};

/** 'list' operation
 *  Accepts arbitrary list of entity/operation arguments
 *  @function
 *  @param  {...Entity} arg any entity or operation
 *  @return {Entity[]}        list of entities
 */
Operation.list = function() {
    var r = new Operation('list');
    r.args = toArray(arguments);
    return r;
};

/** 'raw' operation
 *  Accepts operation name and variadic list of its arguments directly
 *  Use with caution, only when you know what you do
 *  @function
 *  @param  {string}    name operation identifier
 *  @param  {...Entity} arg  any entity or operation
 *  @return {Entity[]}         list of entities
 */
Operation.raw = function() {
    var r = new Operation(arguments[0]);
    r.args = toArray(arguments).slice(1);
    return r;
};

/** 'repr' operation
 *  Produces Brep object in desired format.
 *  "content" field, which contains actual data, may be zip-packed and base64 encoded
 *  You cannot enable compression and disable base64-coding
 *  Format identifiers supported:
 *  "x_b":  Parasolid binary format
 *  "x_t":  Parasolid textual format
 *  "iges": IGES format
 *  "step": STEP
 *  "sat":  SAT
 *  @function
 *  @param  {string}                    format identifier
 *  @param  {Entity}                    entity which should be converted to BREP
 *  @param  {boolean} [is_compressed] compress content data stream or not, default false
 *  @param  {boolean} [is_base64]     encode content data stream as base-64 or not, default true
 *  @return {Entity}  BREP
 */
Operation.repr = op('repr', 4);

/**
 * Convert a given body to a sheet or solid body
 * @functions
 * @param  {Body}           Input Body
 * @param  {String}         Target body type "sheet" or "solid"
 * @return {Sheet|Solid}    Input body converted to a sheet or solid
 */
 Operation.convertBodyType = op('convertBodyType', 2);

/** 'union' operation
 *  Computes union of two geometries
 *  @function
 *  @param  {Sheet|Solid} left
 *  @param  {Sheet|Solid} right
 *  @return {Mesh}        union result
 */
Operation.unite = op('union', 2);

/** 'intersection' operation
 *  Computes intersection of two geometries
 *  @function
 *  @param  {Sheet|Solid} left
 *  @param  {Sheet|Solid} right
 *  @return {Mesh}        intersection result
 */
Operation.intersect = op('intersection', 2);

/** 'difference' operation
 *  Subtracts right geometry from the left one
 *  @function
 *  @param  {Sheet|Solid} left  entity to subtract from
 *  @param  {Sheet|Solid} right entity being subtracted from left
 *  @return {Mesh}                subtraction result
 */
Operation.subtract = op('difference', 2);

/** 'evalDist' operation
 *  Computes distance between two geometries
 *  @function
 *  @param  {Point|Wire|Sheet|Solid} left
 *  @param  {Point|Wire|Sheet|Solid} right
 *  @return {number}                 distance between entities
 */
Operation.evalDist = op('evalDist', 2);

/** 'transform' operation
 *  Transforms 3D entity using affine matrix
 *  @function
 *  @param  {Point|Wire|Sheet|Solid} entity          entity to transform
 *  @param  {Affine}                 transformation  3D affine matrix
 *  @return {Point|Wire|Sheet|Solid}                   first argument, transformed
 */
Operation.transform = op('transform', 2);

/** 'evalMassProps' operation
 *  Computes mass properties of entity
 *
 *  @function
 *  @param  {Wire|Sheet|Solid} entity
 *  @return {MassProps}        mass properties; not defined in this module because cannot be used as query input
 */
Operation.evalMassProps = op('evalMassProps', 1);

/** 'trim' operation
 *  Trims surface with a curve
 *  @function
 *  @param  {Sheet} sheet sheet to be trimmed
 *  @param  {Wire}  curve closed curve which will trim surface (will be projected onto surface if not resides on it)
 *  @return {Sheet}         trimmed sheet
 */
Operation.trim = op('trim', 2);

/** 'extractSheetBoundary' operation
 *  Extracts a sheet body's boundary as a wire body.
 *  @function
 *  @param  {Sheet}       body    sheet body to extract boundary of
 *  @return {Sheet}                 resulting boundary
*/
 Operation.extractSheetBoundary = op('extractSheetBoundary', 1);

/** 'extrude' operation
 *  Extrudes body along direction for a specified distance
 *  @function
 *  @param  {Point|Wire|Sheet} body      extruded profile
 *  @param  {number}           distance  'height' of extrusion
 *  @param  {Vector}           direction extrusion direction
 *  @return {Mesh}
 */
Operation.extrude = op('extrude', 3);

/** 'sweep' operation
 *  Sweeps wire or sheet profile along guide wire
 *  @function
 *  @param  {Wire[]|Sheet[]} profiles profiles being swept
 *  @param  {Wire[]}         guides   guide wires to sweep along
 *  @return {Mesh}
 */
Operation.sweep = op('sweep', 2);

/** 'loft' operation
 *  Lofts a set of profiles along a set of guide wires
 *  @function
 *  @param  {Wire[]|Sheet[]} profiles      lofted profiles
 *  @param  {Wire[]}         guides        lofting guides
 *  @param  {Point[]}        startVertices starting vertices for lofted profiles
 *  @return {Mesh}
 */
Operation.loft = op('loft', 3);

/** 'revolve' operation
 *  Spins specified profile around axis based at origin for a specified angle
 *  @function
 *  @param  {Point|Wire|Sheet} profile spinned profile
 *  @param  {Point}            origin  rotation center
 *  @param  {Vector}           axis    rotation axis, which is normal vector to rotation plane
 *  @param  {number}           angle   spinning angle
 *  @return {Mesh}
 */
Operation.revolve = op('revolve', 4);

/** 'tessellateJson' operation
 *  Constructs JSON representation of specified BREP
 *  @function
 *  @param  {Body}    body      body being tessellated
 *  @param  {number}  quality   tesselation quality, ranges 0-4; the bigger, the better
 *  @param  {number}  units     desired units for result given in terms of relative size of 1 meter
 *  @return {Entity}  BREP
 */
Operation.tessellateJson = op('tessellateJson', 3);

/** 'createPolylineApprox' operation
 *  Converts NURBS curve to polyline
 *  @function
 *  @param  {Curve}     curve
 *  @return {Point[]}
 */
Operation.createPolylineApprox = op('createPolylineApprox', 1);

/** 'createPlanarSheet' operation
 *  Creates a sheet body from a closed curve
 *  @function
 *  @param  {Wire}  curve closed curve
 *  @return {Sheet}
 */
Operation.createPlanarSheet = op('createPlanarSheet', 1);

 /** 'sectionBody' operation
 *  Sections a body with a plane or a sheet
 *  @function
 *  @param  {Sheet|Solid} target
 *  @param  {Sheet|Plane} tool
 *  @return {Sheet|Solid} the piece of original body from 'back' tool side (opposite to where tool's normal points)
 */
Operation.sectionBody = op('sectionBody', 2);

/** 'evalCurve' operation
 *  Evaluates a point and derivatives at a given curve parameter
 *  For b-curves, the parameter space is bound by the lowest and highest value in the knot vector.
 *  For other wires parameter spaces are preset as follows:
 *   Line      - [0, 1]
 *   Polyline  - [0, 1]
 *   Rectangle - [0, 1]
 *   Arc       - [0, 1]
 *   Circle    - [0, 2Pi]
 *   Ellipse   - [0, 2Pi]
 *  Circles and ellipses are always periodic, so it is possible to pass values beyond this interval.
 *  @function
 *  @param  {Curve}   curve
 *  @param  {number}  t       parameter on curve
 *  @param  {number}  nDerivs number of derivatives
 *  @return {Point[]}           a point and N derivatives
 */
Operation.evalCurve = op('evalCurve', 3);

/** 'evalSurface' operation
 *  Evaluates a point and derivatives at a given surface parameter pair
 *  @function
 *  @param  {Sheet}   surface
 *  @param  {number}  u        surface parameter
 *  @param  {number}  v        surface parameter
 *  @param  {number}  nUDerivs derivatives count along U parameter
 *  @param  {number}  nVDerivs derivatives count along V parameter
 *  @return {Point[]}            result point and its nU*nV-1 derivatives
 */
Operation.evalSurface = op('evalSurface', 5);

/** 'makeSubCurve' operation
 *  Creates a curve based on an existing curve's parameter interval
 *  For b-curves, the parameter space is bound by the lowest and highest value in the knot vector.
 *  For other wires parameter spaces are preset as follows:
 *   Line      - [0, 1]
 *   Polyline  - [0, 1]
 *   Rectangle - [0, 1]
 *   Arc       - [0, 1]
 *   Circle    - [0, 2Pi]
 *   Ellipse   - [0, 2Pi]
 *  Circles and ellipses are always periodic, so it is possible to pass values beyond this interval.
 *  @function
 *  @param  {Curve}  curve
 *  @param  {number} t0    subrange start
 *  @param  {number} t1    subrange end
 *  @return {Curve}          sub-curve from t0 to t1
 */
Operation.makeSubCurve = op('makeSubCurve', 3);

/** 'makeSubSurface' operation
 *  Creates a sub-surface based on an existing surface's parameter box
 *  @function
 *  @param  {Sheet}  surface
 *  @param  {number} u0 U subrange start
 *  @param  {number} u1 U subrange end
 *  @param  {number} v0 V subrange start
 *  @param  {number} v1 V subrange end
 *  @return {Sheet}       sub-sheet in ([u0, u1], [v0, v1]) box
 */
Operation.makeSubSurface = op('makeSubSurface', 5);

/** 'offsetBody' operation
 *  'Bloats' sheet or solid body by offsetting all its faces by specified distance, using faces' normals as directions
 *  @function
 *  @param  {Sheet|Solid} body
 *  @param  {number}      distance
 *  @return {Sheet|Solid}
 */
Operation.offsetBody = op('offsetBody', 2);

/** 'offsetWire' operation
 *  'Bloats' planar wire body by offsetting its pieces by specified distance
 *  @function
 *  @param  {Wire}   wire     wire, must lie in one plane
 *  @param  {number} distance distance to offset
 *  @param  {Vector} normal   normal to wire's plane
 *  @return {Wire}
 */
Operation.offsetWire = op('offsetWire', 3);

/** 'createProfiles' operation
 *  Creates a wire or sheet body from a set of wires
 *  @function
 *  @param  {Wire[]}     profiles
 *  @param  {number}     sheetFlag 0 for wire result, otherwise sheet
 *  @return {Wire|Sheet}             cannot be exported, only usable as input for other operations
 */
Operation.createProfiles = op('createProfiles', 2);

/** 'createResilientProfiles' operation
 *  Creates profiles which inner loops are removed
 *  @function
 *  @param  {Wire[]}  profiles
 *  @return {Sheet}   profile
 */
Operation.createResilientProfiles = op('createResilientProfiles', 1);

/** 'evalBoundingBox' operation
 *  Calculates axis-aligned bounding box of an array of entities
 *  @function
 *  @param  {Point|Wire|Sheet|Solid[]} entities
 *  @return {Point[]} minimum and maximum points of the bounding box
 */
Operation.evalBoundingBox = op('evalBoundingBox', 1);

/** 'getBodyInfo' operation
 *  Returns body type and other info of an entity
 *  @function
 *  @param  {Point|Wire|Sheet|Solid} body
 *  @return {BodyInfo} info
 */
Operation.getBodyInfo = op('getBodyInfo', 1);
