'use strict';

var scene = require('../dist/index.js').scene;

/**
 * This test runs several scenes through the validator and checks the results.
 */
describe("Scene validator test", function() {

    var fixtures = [{
        scene: 'badLayerScene',
        message: 'primitive'
    },{
        scene: 'basicScene',
        message: ''
    },{
        scene: 'maxRectangles',
        message: ''
    },{
        scene: 'validGroup',
        message: ''
    },{
        scene: 'linkedGroup',
        message: ''
    },{
        scene: 'linkedGroup2',
        message: ''
    },{
        scene: 'cyclicGroup',
        message: 'Cycle'
    },{
        scene: 'cyclicGroup2',
        message: 'Cycle'
    },{
        scene: 'cyclicGroup3',
        message: 'Cycle'
    },{
        scene: 'cyclicGroup4',
        message: 'equal to parent'
    },{
        scene: 'invalidCamera',
        message: 'camera'
    },{
        scene: 'invalidLight',
        message: 'light'
    },{
        scene: 'scene',
        message: ''
    },{
        scene: 'invalidRevit',
        message: 'revitElement'
    },{
        scene: 'dvpScene',
        message: ''
    }
    ];

    fixtures.forEach(function (testData) {
        it (testData.scene, function() {
            var validator = new scene.Validator();
            var results = validator.validateJSON(require('./data/scene/'+testData.scene+'.json'));
            var valid = testData.message === '';
            expect(results.getResult()).toEqual(valid);
            if (testData.message === '') {
                expect(results.getMessage()).toEqual(testData.message);
            } else {
                expect(results.getMessage()).toContain(testData.message);
            }
        });
    });

});

describe("Scene utils test", function() {
    var fixtures = [
        {
            "description": "String",
            "value": "HELLO",
            "geometry": false
        },
        {
            "description": "Table",
            "value": [[1,2,3],[4,5,6]],
            "geometry": false
        },
        {
            "description": "Sphere",
            "value": {"origin":[0,0,0],"primitive":"sphere","radius":3},
            "geometry": true
        },
        {
            "description": "Rectangle List",
            "value": [{"dimensions":[1,1],"origin":[0,0],"primitive":"rectangle"}],
            "geometry": true
        },
        {
            "description": "DVP-style scene (invalid but still geometry)",
            "value": [
                {"entity": [{"origin": [3,0,0],"primitive": "sphere","radius": 3}],"id": "a","primitive": "geometryList"},
                {"elements": ["a"],"id": "b","primitive": "layer","visible": false}
            ],
            "geometry": true
        }
    ];

    fixtures.forEach(function (testData) {
        it (testData.description, function() {
            var valid = scene.isGeometry(testData.value);
            expect(testData.geometry).toEqual(valid);
        });
    });
});
