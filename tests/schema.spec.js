describe("Schema test", function() {
    'use strict';
    var Ajv   = require('ajv');
    var fs    = require('fs');
    var modeling = require("../modeling");

    var schema    = "../schemas/psworker.json";
    var schemaRaw = fs.readFileSync(schema);
    var schemaJson = JSON.parse(schemaRaw);
    var ajv = Ajv({ allErrors: true });
    ajv.addSchema(schemaJson, "_");

    it ("Sphere should work with the right schema", function() {
        var origin = [0,5,0];
        var radius = 1.25;
        var sphereEntity = modeling.entities.sphere(origin,radius);
        var sphere = JSON.parse(JSON.stringify(sphereEntity));

        var schemaId = "#/entities/circle";
        var validate = ajv.compile({ $ref: "_" + schemaId });
        var isValid = validate(sphere);

        // Check the results
        expect(isValid).toEqual(false);
        expect(validate.errors[0].dataPath).toEqual(".primitive");

        schemaId = "#/entities/sphere";
        validate = ajv.compile({ $ref: "_" + schemaId });
        isValid = validate(sphere);

        expect(isValid).toEqual(true);
    });


    it ("Should allow additional properties", function() {
        var sphere = {"origin":[0,0,0],"primitive":"sphere","radius":10,"bad":"stuff"}

        var schemaId = "#/entities/sphere";
        var validate = ajv.compile({ $ref: "_" + schemaId });
        var isValid = validate(sphere);

        // Check the results
        expect(isValid).toEqual(true);
    });

    it ("Should manage units", function() {
        var cone = {
            "units":{
                "/height":"cm",
                "/origin":"m",
                "/radius":"in"
            },
            "height":10,
            "origin":[0,0,0],
            "primitive":"cone",
            "radius":10,
            "semiAngle":10
        };

        var schemaId = "#/entities/cone";
        var validate = ajv.compile({ $ref: "_" + schemaId });
        var isValid = validate(cone);

        // Check the results
        expect(isValid).toEqual(true);

        var badUnits = {
            "units":{
                "/height":123,
                "/origin":"m"
            },
            "height":10,
            "origin":[0,0,0],
            "primitive":"cone",
            "radius":10,
            "semiAngle":10
        };
        var isValid = validate(badUnits);

        // Check the results
        expect(isValid).toEqual(false);
    });

});