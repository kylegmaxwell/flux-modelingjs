'use strict';

// These entities are not official Flux Entities, but can be rendered as geometry
export var NON_STANDARD_ENTITIES = ['stl', 'obj'];

// These are primitives that are recognized as geometry, but not in the entity schema
export var KNOWN_PRIMITIVES = ['revitElement', 'layer'];

// Enumeration of strings used as primitive types in scenes
export var SCENE_PRIMITIVES = {
    layer: 'layer',
    group: 'group',
    instance: 'instance',
    geometry: 'geometryList',
    material: 'material',
    texture: 'texture',
    camera: 'camera',
    light: 'light'
};

// These properties were renamed, and the old names are the complement (1 - new value)
export var LEGACY_INVERSE_PROPERTIES = {
    opacity: 'transparency',
    roughness: 'glossiness'
};

// Container primitives contain other entities
export var CONTAINER_PRIM_MAP = {
    polycurve: 'curves',
    polysurface: 'surfaces'
};
export var CONTAINER_PRIMS = Object.keys(CONTAINER_PRIM_MAP);

export var DEFAULT_UNITS = 'meters';
