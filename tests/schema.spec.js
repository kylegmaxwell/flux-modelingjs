describe("Schema test", function() {
    'use strict';

    var Ajv   = require('ajv');
    var modeling = require('../dist/index.js');
    var schema = modeling.schema.entity;

    var ajv = Ajv({ allErrors: true });
    ajv.addSchema(schema, "_");

    it ("Sphere should work with the right schema", function() {
        var origin = [0,5,0];
        var radius = 1.25;
        var sphereEntity = modeling.geometry.sphere(origin,radius);
        var sphere = JSON.parse(JSON.stringify(sphereEntity));

        var schemaId = "#/geometry/circle";
        var validate = ajv.compile({ $ref: "_" + schemaId });
        var isValid = validate(sphere);

        // Check the results
        expect(isValid).toEqual(false);
        expect(validate.errors[0].dataPath).toEqual(".primitive");

        schemaId = "#/geometry/sphere";
        validate = ajv.compile({ $ref: "_" + schemaId });
        isValid = validate(sphere);

        expect(isValid).toEqual(true);
    });


    it ("Should allow additional properties", function() {
        var sphere = {"origin":[0,0,0],"primitive":"sphere","radius":10,"bad":"stuff"};

        var schemaId = "#/geometry/sphere";
        var validate = ajv.compile({ $ref: "_" + schemaId });
        var isValid = validate(sphere);

        // Check the results
        expect(isValid).toEqual(true);
    });

    it ("Should allow attributes on instances", function() {
        var inst = {
                    "id": "thing",
                    "attributes":{"label":"My thing"},
                    "primitive": "instance",
                    "entity": "ball",
                    "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -20, 0, 0, 1]
                };
        var schemaId = "#/scene/instance";
        var validate = ajv.compile({ $ref: "_" + schemaId });
        var isValid = validate(inst);

        // Check the results
        expect(isValid).toEqual(true);
    });

    it ("Should manage units", function() {
        var sphere = {
            "units":{
                "ORIGIN":"m",
                "radius":"in"
            },
            "origin":[0,0,0],
            "primitive":"sphere",
            "radius":10
        };

        var schemaId = "#/geometry/sphere";
        var validate = ajv.compile({ $ref: "_" + schemaId });
        var isValid = validate(sphere);

        // Check the results
        expect(isValid).toEqual(true);

        var badUnits = {
            "units":{
                "ORIGIN":1,
                "radius":"in"
            },
            "origin":[0,0,0],
            "primitive":"sphere",
            "radius":10
        };
        isValid = validate(badUnits);

        // Check the results
        expect(isValid).toEqual(false);
    });

});
