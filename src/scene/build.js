/**
 * Utility functions to build and merge scenes.
 */
'use strict';
import * as utils from './utils.js';
import * as element from './element.js';
import prep from './prep.js';

/**
 * Create an instance that contains a data object and add them both to the scene
 * @param  {Array.<Object>} arr Flux Scene
 * @param  {Object} data        Flux JSON object
 * @param  {String} label       Instance name
 * @return {String}             Id of the instance that is created
 */
function addInstance(arr, data, label) {
  let id = utils.generateUUID();
  data.id = id;
  arr.push(data);
  let inst = element.instance(id, label);
  arr.push(inst);
  return inst.id;
}

/**
 * Create a scene with a layer that contains the specified geometry
 * Note: this is used by the CreateLayer block
 * @param  {Object} geometry      Any object that matches the Flux JSON spec
 * @param  {String} layerName     User friendly label on the layer
 * @param  {String} elementPrefix Name for the elements in the layer
 * @return {Array.<Object>}       The scene
 */
export function makeLayerScene(geometry, layerName, elementPrefix) {
  let data = prep(geometry);
  let elements = [];
  let scene = [element.layer(elements, [1,1,1], layerName, true)];
  let prefix = (elementPrefix ? String(prefix) : "MyElement" );
  if (data.constructor === Array) {
    for (let i=0;i<data.length;i++) {
      let instId = addInstance(scene, data[i], prefix+i);
      elements.push(instId);
    }
  } else {
    let instId = addInstance(scene, data, prefix);
    elements.push(instId);
  }
  return scene;
}

/**
 * Create a scene containing the given geometry inside a geometryList
 * Note: this is used by the data view page to encapulate data key contents into a scene
 * @param  {Object} geometry      Any object conforming to the Flux JSON spec
 * @param  {String} layerName     Descriptive label for the layer containing the geometry
 * @param  {type}   elementPrefix Descriptive label for the instance containing the geometry
 * @return {Array.<Object>}       Scene containing the geometry
 */
export function makeListScene(geometry, layerName, elementPrefix) {
    let data = prep(geometry);
    let elements = [];
    let scene = [element.layer(elements, [1,1,1], layerName, true)];
    let prefix = (elementPrefix ? String(prefix) : "MyElement" );
    let list = element.geometryList(data);
    let inst = element.instance(list.id, prefix);
    elements.push(inst.id);
    scene.push(inst);
    scene.push(list);
    return scene;
}

/**
 * Recursively process an object and it's properties and replace id values with new ones.
 * This is used to update references to ids that have changed. Those ids are stored in
 * the input map which is used as a reference for which properties to replace.
 * @param  {Object} object Object with properties
 * @param  {Object} idMap  Map from old id string to new id string
 */
function _uniqueifyObject(object, idMap) {
    for (let key in object) {
        let value = object[key];
        if (value == null) continue;
        if (typeof value === 'object') {
            _uniqueifyObject(value, idMap);
        } else {
            let newId = idMap[value];
            if (newId) {
                object[key] = newId;
            }
        }
    }
}

/**
 * Make a scene unique by prefixing all of its ids.
 * Precondition: scene is already prepped (output of prep function) and mutable
 * @param  {Array.<Object>} scene The scene to modify
 */
function _uniqueifyScene(scene) {
    let id = utils.generateUUID();
    let idMap = {};
    for (let i=0; i<scene.length; i++) {
        let element = scene[i];
        if (element.id) {
            let newId = id + element.id;
            idMap[element.id] = newId;
            element.id = newId;
        }
    }
    _uniqueifyObject(scene, idMap);
}

/**
 * Merge a list of scenes into one, and resolve any id conflicts
 * @param  {Array.<Array>} scenes List of scenes containing Flux JSON elements
 * @param  {StatusMap} statusMap  Container for per primitive errors
 * @return {Array.<Object>}           The combined scene
 */
export function mergeScenes(scenes, statusMap) {
    let finalScene = [];
    for (let s=0; s<scenes.length; s++) {
        if (scenes[s]==null) continue;
        let sceneCopy = prep(scenes[s], statusMap);
        // TODO(Kyle): only do this on scenes that have id collisions
        _uniqueifyScene(sceneCopy);
        finalScene = finalScene.concat(sceneCopy);
    }
    return finalScene;
}
