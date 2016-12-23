'use strict';

// Three.js image loader tries to create an image element and add a listener
// so we have to stub that out.
global.document = global;

// Stub createElement for THREE.ImageLoader
global.createElement = function () {
    return {
        addEventListener: function (name, cb) {
            cb();
        }
    };
};
global.createElementNS = global.createElement;

// Stub XHR for THREE.ImageLoader
global.XMLHttpRequest = function () {
    return {
        addEventListener: function (a, cb) {this.cb = cb;},
        open: function () {},
        send: function () {this.cb();},
        overrideMimeType: function () {}
    };
};

global.self = global;
