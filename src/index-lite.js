'use strict';

/**
 * Entry point for JavaScript
 * Does not include modules that depend on the measure module form emscripten
 * as that does not compile with rollup, and adds a lot of bloat to the bundle.
 */

// core modeling functionality
export { default as Query } from './Query.js';
export { default as Operation } from './Operation.js';

// scene sub module
import * as _scene from './scene/index.js';
export var scene = _scene;

// schema sub module
import * as _schema from './schema/index.js';
export var schema = _schema;

// 3D math library
import * as _math from './math/index.js';
export var math = _math;
