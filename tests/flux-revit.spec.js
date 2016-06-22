describe("flux-revit schema test", function() {
    'use strict';
    var Ajv   = require("ajv");
    var fs    = require("fs");
    var flux  = require('../index');
    var revit = flux.revit;
    var fluxEntitySchema = flux.schemas.pbw;
    var fluxRevitSchema = flux.schemas.revit;

    var ajv = Ajv({
        allErrors: true
    });

    ajv.addSchema(fluxEntitySchema, "flux-entity");
    ajv.addSchema(fluxRevitSchema, "flux-revit");

    describe("revit-wall schema", function() {
        var schemaId = "flux-revit#/revit-wall";
        var validate = ajv.compile({ $ref: schemaId });

        it ("Library created revit-wall should validate", function() {
            var profile = [{
              "units": {
                    "end": "feet",
                    "start": "feet"
                },
              "end": [ 20.31, 17.82, 0 ],
              "primitive": "line",
              "start": [ -63.18, 17.82, 0 ]
            }]
            var validWall = revit.createWall("Id-1", "WallFamily-1",
                    "WallType-1", profile, "Level-1", true, true, {}, {});
            var isValid = validate(validWall.Out);
            if (!isValid) {
                console.log(validate.errors);
            }
            expect(isValid).toEqual(true);
        });

        it ("Valid revit-wall with extra parameters should validate", function() {
            var validWall = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-wall.json"));
            var isValid = validate(validWall);
            expect(isValid).toEqual(true);
        });

        it ("Invalid revit-wall should fail", function() {
            var invalidWall = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-wall.json"));
            var isValid = validate(invalidWall);
            expect(isValid).toEqual(false);
        });
    });


    describe("revit-room schema", function() {
        var schemaId = "flux-revit#/revit-room";
        var validate = ajv.compile({ $ref: schemaId });
        var uv = {
            "primitive": "point",
            "point": [ 1, 1, 1],
            "units": {
                "point": "inches"
            }
        }

        it ("Library created revit-room should validate", function() {
            var validRoom = revit.createRoom(null, uv, "Level-1", "Room-1", {}, {});
            var isValid = validate(validRoom.Out);
            if (!isValid) {
                console.log(validate.errors);
            }
            expect(isValid).toEqual(true);
        });

        it ("Valid revit-room with extra parameers should validate", function() {
            var validRoom = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-room.json"));
            var isValid = validate(validRoom);
            expect(isValid).toEqual(true);
        });

        it ("Invalid revit-room should fail", function() {
            var invalidRoom = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-room.json"));
            var isValid = validate(invalidRoom.Out);
            expect(isValid).toEqual(false);
        });
     });


    describe("revit-reference-plane schema", function() {
        var schemaId = "flux-revit#/revit-referencePlane";
        var validate = ajv.compile({ $ref: schemaId });

        it ("Library created revit-reference-plane should validate", function() {
            var point = {
                "primitive": "point",
                "point": [ 0, 0, 0],
                "units": {
                    "point": "inches"
                }
            }
            var vector = {
                "primitive": "vector",
                "coords": [ 1, 1, 1],
                "units": {
                    "point": "inches"
                }
            }
            var validRefPlane = revit.createReferencePlane("FluxId-1", point, point, vector,
                "RefPlane-1", false);
            var isValid = validate(validRefPlane.Out);
            if (!isValid) {
                console.log(validate.errors);
            }
            expect(isValid).toEqual(true);
        });

        it ("Valid revit-reference-plane with extra parameters should validate", function() {
            var validRefPlane = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-referencePlane.json"));
            var isValid = validate(validRefPlane);
            expect(isValid).toEqual(true);
        });

        it ("Invalid revit-reference-plane should fail", function() {
            var invalidRefPlane = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-referencePlane.json"));
            var isValid = validate(invalidRefPlane);
            expect(isValid).toEqual(false);
        });
    });

    describe("revit-model-curve schema", function() {
        var schemaId = "flux-revit#/revit-modelCurve";
        var validate = ajv.compile({ $ref: schemaId });

        it ("Library created revit-model-curve should validate", function() {
            var curve = {
                "primitive": "line",
                "start": [ 0.0, 0.0, 0.0],
                "end": [10.0, 0.0, 0.0]
            };
            var validCurve = revit.createModelLine("FluxId-1", curve);
            var isValid = validate(validCurve.Out);
            if (!isValid) {
                console.log(validate.errors);
            }
            expect(isValid).toEqual(true);
        });

        it ("Valid revit-model-curve should validate", function() {
            var validCurve = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-modelCurve.json"));
            var isValid = validate(validCurve);
            expect(isValid).toEqual(true);
        });

        it ("Invalid revit-model-curve should fail", function() {
            var invalidCurve = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-modelCurve.json"));
            var isValid = validate(invalidCurve);
            expect(isValid).toEqual(false);
        });
    });

    describe("revit-level schema", function() {
        var schemaId = "flux-revit#/revit-level";
        var validate = ajv.compile({ $ref: schemaId });

        it ("Library created revit-level should validate", function() {
            var validLevel = revit.createLevel("Id-1", "LevelType-1", 10, "Level-1",
                {i1:"InstanceParam 1", i2:"InstanceParam 2"}, {c1: "CustomParam 1", c2:"CustomParam 2"});
            var isValid = validate(validLevel.Out);

            if (!isValid) {
                console.log(validate.errors);
            }
            expect(isValid).toEqual(true);
        });

        it ("Valid revit-level with extra parameters should validate", function() {
            var validLevel = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-level.json"));
            var isValid = validate(validLevel);
            expect(isValid).toEqual(true);
        });

        it ("Invalid revit-level should fail", function() {
            var invalidLevel = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-level.json"));
            var isValid = validate(invalidLevel);
            expect(isValid).toEqual(false);
        });
    });

    describe("revit-floor schema", function() {
        var schemaId = "flux-revit#/revit-floor";
        var validate = ajv.compile({ $ref: schemaId });
        it ("Valid revit-floor should validate", function() {
            var profile = [{
              "units": {
                    "end": "feet",
                    "start": "feet"
                },
              "end": [ 20.31, 17.82, 0 ],
              "primitive": "line",
              "start": [ -63.18, 17.82, 0 ]
            }]
            var validFloor = revit.createFloor("Id-1", "FloorType-1", profile, "Level-1", true,
                {i1: "InstanceParam 1", i2: "InstanceParam 2"}, {c1:"CustomParam 1", c2:"CustomParam 2"});
            var isValid = validate(validFloor.Out);
            if (!isValid) {
                console.log(validate.errors);
            }
            expect(isValid).toEqual(true);
        });

        it ("Valid revit-floor with extra parameters should validate", function() {
            var validFloor = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-floor.json"));
            var isValid = validate(validFloor);
            expect(isValid).toEqual(true);
        });

        it ("Invalid revit-floor should fail", function() {
            var invalidFloor = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-floor.json"));
            var isValid = validate(invalidFloor);
            expect(isValid).toEqual(false);
        });
    });

    describe("revit-one-level-familyinstance schema", function() {
        var schemaId = "flux-revit#/revit-oneLevelFamilyInstance";
        var validate = ajv.compile({ $ref: schemaId });

        it ("Library created revit-one-level-familyInstance should validate", function() {
            var point = {
                "primitive": "point",
                "point": [ 0, 0, 0],
                "units": {
                    "point": "inches"
                }
            }
            var validFamilyInstance = revit.createOneLevelFamilyInstance("Id-1", "Category-1",
                "Family-1", "Type-1", point, "Level-1", "NonStructural", false, false, {},{});
            var isValid = validate(validFamilyInstance.Out);
            if (!isValid) {
                console.log(validate.errors);
            }
            expect(isValid).toEqual(true);
        });

        it ("Valid revit-one-level-familyinstance with extra parameters should validate", function() {
            var validFamilyInstance = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-oneLevelFamilyInstance.json"));
            var isValid = validate(validFamilyInstance);
            expect(isValid).toEqual(true);
        });

        it ("Valid revit-one-level-familyinstance should fail", function() {
            var invalidFamilyInstance = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-oneLevelFamilyInstance.json"));
            var isValid = validate(invalidFamilyInstance);
            expect(isValid).toEqual(false);
        });
    });

    describe("revit-two-level-familyinstance schema", function() {
        var schemaId = "flux-revit#/revit-twoLevelFamilyInstance";
        var validate = ajv.compile({ $ref: schemaId });

        it ("Library created revit-two-level-familyinstance should validate", function() {
            var point = [0.0, 0.0, 0.0];
            var validFamilyInstance = revit.createTwoLevelFamilyInstance("Id-1", "Category-1",
                "Family-1", "Type-1", point, "Level-1", "Level-2", "NonStructural",
                false, false, {}, {});
            var isValid = validate(validFamilyInstance.Out);
            if (!isValid) {
                console.log(validate.errors);
            }
            expect(isValid).toEqual(true);
        });

        it ("Valid revit-two-level-familyinstance with extra parameters should validate", function() {
            var validFamilyInstance = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-twoLevelFamilyInstance.json"));
            var isValid = validate(validFamilyInstance);
            expect(isValid).toEqual(true);
        });

        it ("Valid revit-two-level-familyinstance should fail", function() {
            var invalidFamilyInstance = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-twoLevelFamilyInstance.json"));
            var isValid = validate(invalidFamilyInstance);
            expect(isValid).toEqual(false);
        });
    });

    describe("revit-one-level-hosted-familyinstance", function() {
        var schemaId = "flux-revit#/revit-oneLevelHostedFamilyInstance";
        var validate = ajv.compile({ $ref: schemaId });

        it ("Library created revit-one-level-hosted-familyinstance should validate", function() {
            var point = [10.0, 0.0, 0.0];
            var validFamilyInstance = revit.createOneLevelHostedFamilyInstance("Id-1", "Category-1", "Family-1",
                "Type-1", point, "HostId-1", "Level-1", "NonStructural", false, false, {}, {});
            var isValid = validate(validFamilyInstance.Out);
            if (!isValid) {
                console.log(validate.errors);
            }
            expect(isValid).toEqual(true);
        });

        it ("Valid revit-one-level-hosted-familyinstance with extra parameters should validate", function() {
            var validFamilyInstance = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-oneLevelHostedFamilyInstance.json"));
            var isValid = validate(validFamilyInstance);
            expect(isValid).toEqual(true);
        });

        it ("Valid revit-one-level-hosted-familyinstance should fail", function() {
            var invalidFamilyInstance = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-oneLevelHostedFamilyInstance.json"));
            var isValid = validate(invalidFamilyInstance);
            expect(isValid).toEqual(false);
        });
    });
});