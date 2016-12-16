'use strict';

import * as types from '../types.js';
import FluxModelingError from '../FluxModelingError.js';
import * as units from '../units.js';
import * as _affine from './affine.js';
import primitive from './helpers.js';

// convenience aliases
var s = types.helpers;
var coords = units.coords;
var vecCoords = units.vecCoords;
var mapCoords = units.mapCoords;

/**
 * Entity constructors
 */

//******************************************************************************
// Vector entity
//******************************************************************************

/** Constructs Vector entity
 *
 *  @function
 *  @param  {number[]|Vector} vec vector coordinates
 *  @return {Vector} New entity
 */
export function vector(vec) {
    types.checkAllAndThrow(
        ["Components", s.AnyOf(s.Type("position"), s.Entity("vector")), vec]);
    return primitive('vector', { coords: vecCoords(vec) });
}

//******************************************************************************
// Point entity
//******************************************************************************

/** Constructs point entity
 *
 *  @function
 *  @param  {number[]|Point} point array with point coordinates
 *  @param  {string}         [id]   optional, entity id
 *  @return {Point} New entity
 */
export function point(point, id) {
    types.checkAllAndThrow(
        ["Point", s.AnyOf(s.Type("position"), s.Entity("point")), point],
        ["Id", s.Maybe(s.String), id]);
    return primitive('point', {
        point: coords(point)
    });
}

//******************************************************************************
// Wire entities
//******************************************************************************

/** Constructs line entity
 *
 *  @function
 *  @param  {number[]|Point} start starting point
 *  @param  {number[]|Point} end   end point
 *  @param  {string}         [id]  optional, entity id
 *  @return {Wire}          line entity
 */
export function line(start, end, id) {
    types.checkAllAndThrow(
        ["Start", s.AnyOf(s.Type("position"), s.Entity("point")), start],
        ["End", s.AnyOf(s.Type("position"), s.Entity("point")), end],
        ["Id", s.Maybe(s.String), id ]);
    return primitive('line', {
        start:   coords(start),
        end:     coords(end)
    });
}

/** Constructs polyline entity
 *
 *  @function
 *  @param  {...number[]|Point} point a set of points forming polyline
 *  @return {Wire}                      polyline entity
 */
 // TODO(andrew): add typechecking to polyline. Consider passing an array of
 // of points as a single arguement, rather than processing the array of
 // arguments.
export function polyline() {
    return primitive('polyline', {
        points: mapCoords(arguments)
    });
}

/** Constructs arc entity
 *
 *  @function
 *  @param  {number[]|Point}    start  start point
 *  @param  {number[]|Point}    middle middle point
 *  @param  {number[]|Point}    end    end point
 *  @param  {string}            [id]   optional, entity id
 *  @return {Wire}              arc entity
 */
export function arc(start, middle, end, id) {
    types.checkAllAndThrow(
        ["Start", s.AnyOf(s.Type("position"), s.Entity("point")), start],
        ["Middle", s.AnyOf(s.Type("position"), s.Entity("point")), middle],
        ["End", s.AnyOf(s.Type("position"), s.Entity("point")), end],
        ["Id", s.Maybe(s.String), id]);
    return primitive('arc', {
        start:    coords(start),
        middle:   coords(middle),
        end:      coords(end)
    });
}

/** Constructs NURBS curve entity
 *
 *  @function
 *  @param  {number} degree curve's NURBS degree
 *  @param  {Array.number} controlPoints curve's control points
 *  @param  {Array.number} knots Interval boundaries
 *  @param  {Array.number} weights Relative weights of control points
 *  @param  {string} [id]   optional, entity id
 *  @return {Curve}           curve entity
 */
export function curve(degree, controlPoints, knots, weights, id) {
    types.checkAllAndThrow(
        ["Degree", s.PositiveInteger, degree],
        ["ControlPoints", s.ArrayOf(s.AnyOf(s.Entity("point"), s.Type("position"))), controlPoints],
        ["Knots", s.ArrayOf(s.Number), knots],
        ["Weights", s.Maybe(s.ArrayOf(s.Number)), weights],
        ["Id", s.Maybe(s.String), id]);

    if (knots.length != controlPoints.length + degree + 1) {
        throw Error("Expect number of input knots (" + knots.length +
            ") to equal the number of control points (" + controlPoints.length +
            ") the degree of the curve (" + degree +
            ")+ 1, which is "+(controlPoints.length + degree + 1));
    }

    if (weights && weights.length != controlPoints.length) {
        throw Error("Expect weights to have length (got "+ weights.length +
                    ") that is the same as controlPoints (got " + controlPoints.Length +
                    ").");
    }

    return primitive('curve', {
        degree: degree,
        knots: knots,
        controlPoints: mapCoords(controlPoints),
        weights: weights
    });
}

/** Constructs circle entity
 *
 *  @function
 *  @param  {number[]|Point}    center circle center
 *  @param  {number}            r      radius
 *  @param  {string}            [id]   optional, entity id
 *  @return {Wire}            circle entity
 */
export function circle(center, r, id) {
    types.checkAllAndThrow(
        ["Center", s.AnyOf(s.Type("position"), s.Entity("point")), center],
        ["Radius", s.Type("distance"), r],
        ["Id", s.Maybe(s.String), id]);
    return primitive('circle', {
        origin:   coords(center),
        radius:   r,
        axis: vecCoords([0,0,1])
    });
}

/** Constructs ellipse entity
 *
 *  @function
 *  @param  {number[]|Point}  center Center point
 *  @param  {number}          majorRadius major radius
 *  @param  {number}          minorRadius minor radius
 *  @param  {number[]|Vector} direction   major direction
 *  @param  {string}          [id]   optional, entity id
 *  @return {Wire} New entity
 */
export function ellipse(center, majorRadius, minorRadius, direction, id) {
    types.checkAllAndThrow(
        ["Center", s.AnyOf(s.Type("position"), s.Entity("point")), center],
        ["MajorRadius", s.Type("distance"), majorRadius],
        ["MinorRadius", s.Type("distance"), minorRadius],
        ["Direction", s.AnyOf(s.Type("direction"), s.Entity("vector")), direction],
        ["Id", s.Maybe(s.String), id]);
    return primitive('ellipse', {
        origin:      coords(center),
        majorRadius: majorRadius,
        minorRadius: minorRadius,
        reference:   vecCoords(direction),
        axis:        vecCoords([0,0,1])
    });
}

/** Constructs rectangle entity
 *
 *  @function
 *  @param  {number[]|Point}  center Center point
 *  @param  {number[]|Vector} span Length of the rectangle along its local x and y axes
 *  @return {Wire} new Entity
 */
export function rectangle(center, span) {
    types.checkAllAndThrow(
        ["Center", s.AnyOf(s.Type("position"), s.Entity("point")), center],
        ["Span", s.AnyOf(s.ArrayOf(s.Number), s.Entity("vector")), span]);
    var c = vecCoords(span);
    if (c.length != 2) {
        throw new FluxModelingError("Expected rectangle dimensions to be 2-dimensional.");
    }
    return primitive('rectangle', { origin: coords(center), dimensions: c, axis: [0,0,1], reference: [1,0,0] });
}

/** Constructs rectangle entity
 *
 *  @function
 *  @param  {number[]|Point} lo Minimum point on corner
 *  @param  {number[]|Point} hi Maximum point on corner
 *  @return {Wire} new Entity
 */
export function rectangleByCorners(lo, hi) {
    // Lo and Hi could be either a modeling/Point or a list of numbers.
    lo = coords(lo);
    hi = coords(hi);

    if (lo[2] !== hi[2]) {
        throw "Z-coordinates of rectangle must be equal: got "+lo[2]+", "+hi[2]+".";
    }

    var origin = [(lo[0] + hi[0]) / 2.0, (lo[1] + hi[1]) / 2.0, lo[2]];
    var dimensions = [  Math.abs(hi[0] - lo[0]),
                        Math.abs(hi[1] - lo[1]) ];
    return rectangle(origin,dimensions);
}

/** Constructs polycurve entity
 *
 *  Polycurve may represent any wire body, including non-manifold and disjoint
 *
 *  @function
 *  @param  {Wire[]}  curves Curves to join
 *  @return {Wire} New collection entity
 */
export function polycurve(curves) {
    types.checkAllAndThrow(
        ["Curves", s.ArrayOf(s.AnyOf(s.Entity("curve"), s.Entity("line"), s.Entity("arc"), s.Entity("polyline"))), curves]);
    return primitive('polycurve', { curves: curves });
}

//******************************************************************************
// Sheet entities
//******************************************************************************

/** Constructs NURBS surface
 *
 *  @function
 *  @param  {number}  uDegree NURBS degree along U parameter
 *  @param  {number}  vDegree NURBS degree along V parameter
 *  @param  {Array.Array.<number>}  controlPoints NURBS control points
 *  @param  {Array.<number>}  uKnots NURBS knots along U parameter
 *  @param  {Array.<number>}  vKnots NURBS knots along V parameter
 *  @param  {Array.Array.<number>}  weights NURBS weights
 *  @return {Surface}           NURBS surface entity
 */
export function surface(uDegree, vDegree, controlPoints, uKnots, vKnots, weights) {
    types.checkAllAndThrow(
        ["UDegree", s.PositiveInteger, uDegree],
        ["VDegree", s.PositiveInteger, vDegree],
        ["ControlPoints", s.ArrayOf(
            s.ArrayOf(s.AnyOf(s.Entity("point"), s.Type("position")))), controlPoints],
        ["UKnots", s.ArrayOf(s.Number), uKnots],
        ["VKnots", s.ArrayOf(s.Number), vKnots],
        ["Weights", s.Maybe(s.ArrayOf(s.Number)), weights]);
    var M = controlPoints.length;
    var N = controlPoints[0].length;

    if (uKnots.length != M + uDegree + 1) {
        throw Error("In the u-direction, expect number of input knots (" + uKnots.length +
            ") to equal the number of control points (" + M +
            ") the degree of the curve (" + uDegree +
            ") + 1, which is "+ (M + uDegree + 1));
    }
    if (vKnots.length != N + vDegree + 1) {
        throw Error("In the v-direction, expect number of input knots (" + vKnots.length +
            ") to equal the number of control points (" + N +
            ") the degree of the curve (" + vDegree +
            ") + 1, which is "+ (N + vDegree + 1));
    }

    // Check that all rows have the right length and unpack point entities
    // into their coordinate vectors.
    for (var i = 0; i < controlPoints.length; i++) {
        var row = controlPoints[i];
        if(row.length != N) {
            throw Error("Not all rows of control points are of equal length. Got " + row.length +
                " but expected " + N);
        }
        controlPoints[i] = mapCoords(row);
    }

    // TODO(andrew): assert that weights have the same shape as controlPoints.

    return primitive('surface', {
        uDegree: uDegree,
        vDegree: vDegree,
        uKnots: uKnots,
        vKnots: vKnots,
        controlPoints: controlPoints,
        weights: weights
    });
}

/** Constructs polysurface entity
 *
 *  Polysurface may represent any sheet or solid body, including non-manifold and disjoint
 *
 *  @function
 *  @param  {Sheet[]}  surfaces Surfaces to join
 *  @return {Sheet} New collection entity
 */
export function polysurface(surfaces) {
    types.checkAllAndThrow(
        ["Surfaces", s.ArrayOf(s.Entity("surface")), surfaces]);
    return primitive('polysurface', { surfaces: surfaces });
}

//******************************************************************************
// Solid entities
//******************************************************************************

/** Constructs 3D mesh
 *
 *  @function
 *  @param {Array.Array<number>} vertices The points on the mesh
 *  @param {Array.Array<number>} faces The polygons of the mesh
 *  @return {Mesh} mesh entity
 */
export function mesh(vertices, faces) {
    types.checkAllAndThrow(
        ["Vertices", s.ArrayOf(s.AnyOf(s.Entity("point"), s.Type("position"))), vertices],
        ["Faces", s.ArrayOf(s.ArrayOf(s.Type("index"))), faces]);
    return primitive('mesh', { vertices: mapCoords(vertices), faces: faces });
}

/** Constructs 3D solid block
 *
 *  @function
 *  @param  {number[]|Point}  center Center point
 *  @param  {number[]|Vector} span block dimensions along axes
 *  @return {Solid} New entity
 */
export function block(center, span) {
    types.checkAllAndThrow(
        ["Center", s.AnyOf(s.Type("position"), s.Entity("point")), center],
        ["Dimensions", s.AnyOf(s.Type("position"), s.Entity("vector")), span]);
    return primitive('block', { origin: coords(center), dimensions: vecCoords(span), axis: [0,0,1], reference:[1,0,0] });
}

/** Constructs sphere
 *
 *  @function
 *  @param  {number[]|Point} c Center point
 *  @param  {number}         r Distance from center to surface
 *  @return {Solid} New entity
 */
export function sphere(c, r) {
    types.checkAllAndThrow(
        ["Center", s.AnyOf(s.Type("position"), s.Entity("point")), c],
        ["Radius", s.Type("distance"), r]);
    return primitive('sphere', { origin: coords(c), radius: r });
}
//******************************************************************************
// Other entities
//******************************************************************************

/** Constructs infinite plane
 *
 *  @function
 *  @param  {number[]|Point}  o in-plane point (origin)
 *  @param  {number[]|Vector} n plane's normal vector
 *  @return {Plane} New entity
 */
export function plane(o, n) {
    types.checkAllAndThrow(
        ["Origin", s.AnyOf(s.Type("position"), s.Entity("point")), o],
        ["Normal", s.AnyOf(s.Type("position"), s.Entity("vector")), n]);
    return primitive('plane', {
        origin: coords(o),
        normal: vecCoords(n)
    });
}

export var affine = _affine;
