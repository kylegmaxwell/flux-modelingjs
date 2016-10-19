'use strict';

// These entities are not official Flux Entities, but can be rendered as geometry
export var NON_STANDARD_ENTITIES = ['stl', 'obj', 'text'];

// These are primitives that are recognized as geometry, but not in the entity schema
export var KNOWN_PRIMITIVES = ['revitElement', 'layer'];

// Enumeration of strings used as primitive types in scenes
export var SCENE_PRIMITIVES = {
    layer: 'layer',
    group: 'group',
    instance: 'instance',
    geometry: 'geometryList'
};
