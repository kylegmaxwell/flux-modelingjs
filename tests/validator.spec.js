/**
 * This test runs several scenes through the validator and checks the results.
 */
describe("Scene validator test", function() {
    'use strict';

    var Validator = require('../dist/index.js').scene.Validator;

    var fixture = [{
        scene: 'badLayerScene',
        message: 'element'
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
    }
    ];

    fixture.forEach(function (testData) {
        it (testData.scene, function() {
            var validator = new Validator();
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
