/**
 * This test runs several scenes through the validator and checks the results.
 */
describe("Scene validator test", function() {
    'use strict';

    var SceneValidator = require('../SceneValidator.js');

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
        scene: 'validAssembly',
        message: ''
    },{
        scene: 'linkedAssembly',
        message: ''
    },{
        scene: 'linkedAssembly2',
        message: ''
    },{
        scene: 'cyclicAssembly',
        message: 'Cycle'
    },{
        scene: 'cyclicAssembly2',
        message: 'Cycle'
    },{
        scene: 'cyclicAssembly3',
        message: 'Cycle'
    },{
        scene: 'cyclicAssembly4',
        message: 'equal to parent'
    }
    ];

    fixture.forEach(function (testData) {
        it (testData.scene, function() {
            var validator = new SceneValidator();
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