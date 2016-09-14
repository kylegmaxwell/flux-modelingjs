'use strict';

import * as types from '../types.js';
import * as units from '../units.js';
import primitive from './helpers.js';

// convenience aliases
var s = types.helpers;
var coords = units.coords;
var vecCoords = units.vecCoords;

var eps = 1e-8;


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

function normalize(arr) {
    var m = Math.sqrt(arr[0]*arr[0] + arr[1]*arr[1]  + arr[2]*arr[2]);
    if (m > eps) {
        return [arr[0]/m, arr[1]/m, arr[2]/m];
    } else {
        return arr;
    }
}

/** Constructs affine transformation matrix
 *
 *  @function
 *  @param  {number[]} matrix initial matrix
 *  @return {Affine}              affine transformation matrix entity
 */
export function byMatrix(matrix) {
    types.checkAllAndThrow(
        ["Matrix", s.ArrayOf(s.Number), matrix]);
    return primitive('affineTransform', { mat: matrix });
}

/** Compose two transformations
 *
 *  @function
 *  @param  {number[]|Affine} [a] first matrix
 *  @param  {number[]|Affine} [b] second matrix
 *  @return {Affine}              affine transformation matrix entity
 */
export function byComposition(a, b) {
    //TODO(andrew): make sure that both matrices have the same units.
    // Requires https://vannevar.atlassian.net/browse/LIB3D-362
    types.checkAllAndThrow(
        ["A", s.AnyOf(s.ArrayOf(s.Number), s.Entity("affineTransform")), a],
        ["B", s.AnyOf(s.ArrayOf(s.Number), s.Entity("affineTransform")), b]
        );
    if(a.primitive) {
        a = a.mat;
    }
    if(b.primitive) {
        b = b.mat;
    }
    return primitive('affineTransform', {mat: multMatrix(a, b)});
}

/** Rotation around X axis
 *  @param  {number} phi rotation angle, in degrees
 *  @return {this}         this, for chaining
 */
export function rotateX(phi) {
    types.checkAllAndThrow(
        ["XRotation", s.Number, phi]);
    phi = phi * Math.PI / 180;
    var sin = Math.sin(phi), cos = Math.cos(phi);
    return primitive('affineTransform', {mat: [
         1,    0,    0, 0,
         0,  cos,  sin, 0,
         0, -sin,  cos, 0,
         0,    0,    0, 1
    ]});
}

/** Rotation around Y axis
 *  @param  {number} phi rotation angle, in degrees
 *  @return {this}         this, for chaining
 */
export function rotateY(phi) {
    types.checkAllAndThrow(
        ["YRotation", s.Number, phi]);
    phi = phi * Math.PI / 180;
    var sin = Math.sin(phi), cos = Math.cos(phi);
    return primitive('affineTransform', {mat: [
          cos, 0, -sin, 0,
            0, 1,    0, 0,
          sin, 0,  cos, 0,
            0, 0,    0, 1
    ]});
}

/** Rotation around Z axis
 *  @param  {number} phi rotation angle, in degrees
 *  @return {this}         this, for chaining
 */
export function rotateZ(phi) {
    types.checkAllAndThrow(
        ["ZRotation", s.Number, phi]);
    phi = phi * Math.PI / 180;
    var sin = Math.sin(phi), cos = Math.cos(phi);
    return primitive('affineTransform', {mat: [
          cos,  sin, 0, 0,
         -sin,  cos, 0, 0,
            0,    0, 1, 0,
            0,    0, 0, 1
    ]});
}

/** Reflect against specified plane
 *  @param  {number[]|Point} n plane's normal vector
 *  @param  {number[]|Point} p in-plane point
 *  @return {object}                affineTransform entity
 */
export function reflect(n, p) {
    types.checkAllAndThrow(
        ["Normal", s.AnyOf(s.Entity('vector'), s.Type('position')), n],
        ["Point", s.AnyOf(s.Entity('point'), s.Type('position')), n]);
    n = vecCoords(n);
    p = coords(p);
    var nx = n[0], ny = n[1], nz = n[2],
        px = p[0], py = p[1], pz = p[2];

    var len = Math.sqrt(nx*nx + ny*ny + nz*nz);
    nx /= len; ny /= len; nz /= len;

    var d = -nx * px - ny * py - nz * pz;

    return primitive('affineTransform', {mat: [
        1.0 - 2 * nx * nx,  -2 * nx * ny,       -2 * nx * nz,       -2 * nx * d,
        -2 * nx * ny,       1.0 - 2 * ny * ny,  -2 * ny * nz,       -2 * ny * d,
        -2 * nx * nz,       -2 * ny * nz,       1.0 - 2 * nz * nz,  -2 * nz * d,
        0,                  0,                  0,                  1
    ]});
}

/** Rotate around arbitrary vector
 *  @param  {number[]|Vector} a rotation axis
 *  @param  {number}          phi  rotation angle, in degrees
 *  @return {object}                affineTransform entity
 */
export function rotateAboutAxis(a, phi) {
    types.checkAllAndThrow(
        ["Axis", s.AnyOf(s.Entity('vector'), s.Type('position')), a],
        ["Rotation", s.Number, phi]);
    phi = phi * Math.PI / 180;
    var sin = Math.sin(phi), cos = Math.cos(phi);
    a = vecCoords(a);
    a = normalize(a);
    var x = a[0], y = a[1], z = a[2];
    return primitive('affineTransform', {mat: [
        cos+x*x*(1-cos),    x*y*(1-cos)-z*sin, y*sin+x*z*(1-cos),  0,
        z*sin+x*y*(1-cos),  cos+y*y*(1-cos),   -x*sin+y*z*(1-cos), 0,
        -y*sin+x*z*(1-cos), x*sin+y*z*(1-cos), cos+z*z*(1-cos),    0,
        0,                  0,                 0,                  1
    ]});
}

/** 3D scaling
 *  @param  {number[]|Vector} scale scaling vector
 *  @return {object}                affineTransform entity
 */
export function scale(scale) {
    types.checkAllAndThrow(
        ["Scale", s.AnyOf(s.Entity('vector'), s.Type('position')), scale]);
    scale = vecCoords(scale);
    return primitive('affineTransform', {mat: [
        scale[0],   0,          0,          0,
           0,       scale[1],   0,          0,
           0,       0,          scale[2],   0,
           0,       0,          0,          1
    ]});
}

/** 3D translation
 *  @param  {number[]|Vector} d displacement vector (scale)
 *  @return {object}                affineTransform entity
 */
export function translate(d) {
    types.checkAllAndThrow(
        ["Displacement", s.AnyOf(s.Entity('vector'), s.Type('position')), d]);
    d = vecCoords(d);
    return primitive('affineTransform', {mat: [
         1,  0,  0, d[0],
         0,  1,  0, d[1],
         0,  0,  1, d[2],
         0,  0,  0,  1
    ]});
}
