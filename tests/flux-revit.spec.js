describe("fluxRevit schema test", function() {
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

    ajv.addSchema(fluxEntitySchema, "fluxEntity");
    ajv.addSchema(fluxRevitSchema, "fluxRevit");

    describe("revitWall schema", function() {
        var schemaId = "fluxRevit#/revitWall";
        var validate = ajv.compile({ $ref: schemaId });

        it ("Library created revitWall should validate", function() {
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

        it ("Revit Wall with mesh geometry should validate", function() {
            var profile = [{
              "units": {
                    "end": "feet",
                    "start": "feet"
                },
              "end": [ 20.31, 17.82, 0 ],
              "primitive": "line",
              "start": [ -63.18, 17.82, 0 ]
            }]
            var wallGeometry = [{
                "primitive": "mesh",
                "faces": [[0,1,2],[1,2,3]],
                "vertices": [[0.0,0.0,0.0],[1.00,1.00,1.00]],
                "units": {
                    "vertices": "meters"
                }
            }]
            var validWall = revit.createWall("Id-1", "WallFamily-1",
                    "WallType-1", profile, "Level-1", true, true, {}, {});

            validWall.Out.geometryParameters.geometry = wallGeometry;

            var isValid = validate(validWall.Out);
            if (!isValid) {
                console.log(validate.errors);
            }
            expect(isValid).toEqual(true);
        });

        it ("Revit Wall with invalid geometry should not validate", function() {
            var profile = [{
              "units": {
                    "end": "feet",
                    "start": "feet"
                },
              "end": [ 20.31, 17.82, 0 ],
              "primitive": "line",
              "start": [ -63.18, 17.82, 0 ]
            }]
            var wallGeometry = [{
                "primitive": "invalidMesh",
                "faces": [[0,1,2],[1,2,3]],
                "vertices": [[0.0,0.0,0.0],[1.00,1.00,1.00]],
                "units": {
                    "vertices": "meters"
                }
            }]
            var validWall = revit.createWall("Id-1", "WallFamily-1",
                    "WallType-1", profile, "Level-1", true, true, {}, {});

            validWall.Out.geometryParameters.geometry = wallGeometry;
            var isValid = validate(validWall.Out);
            expect(isValid).toEqual(false);
        });

        it ("Revit wall with valid materialInfo should validate", function() {
            var profile = [{
              "units": {
                    "end": "feet",
                    "start": "feet"
                },
              "end": [ 20.31, 17.82, 0 ],
              "primitive": "line",
              "start": [ -63.18, 17.82, 0 ]
            }]
            var material = [
            {
                "name": "Material 1",
                "area": 204.5,
                "volume": 0.0,
                "paintMaterial": true,
                "instanceParameters": {
                    "toxic": true
                },
                "customParameters": {
                    "customParam": "Quartz Parameter"
                }
            },
            {
                "name": "Material 2",
                "area": 0.0,
                "volume": 555.26,
                "paintMaterial": false,
                "instanceParameters": {}
            }]

            var validWall = revit.createWall("Id-1", "WallFamily-1",
                    "WallType-1", profile, "Level-1", true, true, {}, {});

            validWall.Out.materialInfo = material;

            var isValid = validate(validWall.Out);
            if (!isValid) {
                console.log(validate.errors);
            }
            expect(isValid).toEqual(true);
        });

        it ("Revit wall with invalid materialInfo should not validate", function() {
            var profile = [{
              "units": {
                    "end": "feet",
                    "start": "feet"
                },
              "end": [ 20.31, 17.82, 0 ],
              "primitive": "line",
              "start": [ -63.18, 17.82, 0 ]
            }]
            var material = [
            {
                "name": "Material 1",
                "area": 204.5,
                "paintMaterial": true,
                "instanceParameters": {
                    "toxic": true
                },
                "customParameters": {
                    "customParam": "Quartz Parameter"
                }
            },
            {
                "Name": "Material 2",
                "area": 0.0,
                "volume": 555.26,
                "paintMaterial": false,
                "instanceParameters": {}
            }]

            var validWall = revit.createWall("Id-1", "WallFamily-1",
                    "WallType-1", profile, "Level-1", true, true, {}, {});

            validWall.Out.materialInfo = material;

            var isValid = validate(validWall.Out);
            expect(isValid).toEqual(false);
        });

        it ("Valid revitWall with extra parameters should validate", function() {
            var validWall = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-wall.json"));
            var isValid = validate(validWall);
            expect(isValid).toEqual(true);
        });

        it ("Invalid revitWall should fail", function() {
            var invalidWall = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-wall.json"));
            var isValid = validate(invalidWall);
            expect(isValid).toEqual(false);
        });
    });


    describe("revitRoom schema", function() {
        var schemaId = "fluxRevit#/revitRoom";
        var validate = ajv.compile({ $ref: schemaId });
        var uv = {
            "primitive": "point",
            "point": [ 1, 1, 1],
            "units": {
                "point": "inches"
            }
        }

        it ("Library created revitRoom should validate", function() {
            var validRoom = revit.createRoom(null, uv, "Level-1", "Room-1", {}, {});
            var isValid = validate(validRoom.Out);
            if (!isValid) {
                console.log(validate.errors);
            }
            expect(isValid).toEqual(true);
        });

        it ("Valid revitRoom with extra parameers should validate", function() {
            var validRoom = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-room.json"));
            var isValid = validate(validRoom);
            expect(isValid).toEqual(true);
        });

        it ("Invalid revitRoom should fail", function() {
            var invalidRoom = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-room.json"));
            var isValid = validate(invalidRoom.Out);
            expect(isValid).toEqual(false);
        });
     });


    describe("revitReferencePlane schema", function() {
        var schemaId = "fluxRevit#/revitReferencePlane";
        var validate = ajv.compile({ $ref: schemaId });

        it ("Library created revitReferencePlane should validate", function() {
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

        it ("Valid revitReferencePlane with extra parameters should validate", function() {
            var validRefPlane = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-referencePlane.json"));
            var isValid = validate(validRefPlane);
            expect(isValid).toEqual(true);
        });

        it ("Invalid revitReferencePlane should fail", function() {
            var invalidRefPlane = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-referencePlane.json"));
            var isValid = validate(invalidRefPlane);
            expect(isValid).toEqual(false);
        });
    });

    describe("revitModelCurve schema", function() {
        var schemaId = "fluxRevit#/revitModelCurve";
        var validate = ajv.compile({ $ref: schemaId });

        it ("Library created revitModelCurve should validate", function() {
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

        it ("Valid revitModelCurve should validate", function() {
            var validCurve = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-modelCurve.json"));
            var isValid = validate(validCurve);
            expect(isValid).toEqual(true);
        });

        it ("Invalid revitModelCurve should fail", function() {
            var invalidCurve = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-modelCurve.json"));
            var isValid = validate(invalidCurve);
            expect(isValid).toEqual(false);
        });
    });

    describe("revitLevel schema", function() {
        var schemaId = "fluxRevit#/revitLevel";
        var validate = ajv.compile({ $ref: schemaId });

        it ("Library created revitLevel should validate", function() {
            var validLevel = revit.createLevel("Id-1", "LevelType-1", 10, "Level-1",
                {i1:"InstanceParam 1", i2:"InstanceParam 2"}, {c1: "CustomParam 1", c2:"CustomParam 2"});
            var isValid = validate(validLevel.Out);

            if (!isValid) {
                console.log(validate.errors);
            }
            expect(isValid).toEqual(true);
        });

        it ("Valid revitLevel with extra parameters should validate", function() {
            var validLevel = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-level.json"));
            var isValid = validate(validLevel);
            expect(isValid).toEqual(true);
        });

        it ("Invalid revitLevel should fail", function() {
            var invalidLevel = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-level.json"));
            var isValid = validate(invalidLevel);
            expect(isValid).toEqual(false);
        });
    });

    describe("revitFloor schema", function() {
        var schemaId = "fluxRevit#/revitFloor";
        var validate = ajv.compile({ $ref: schemaId });
        it ("Valid revitFloor should validate", function() {
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

        it ("Valid revitFloor with extra parameters should validate", function() {
            var validFloor = JSON.parse(fs.readFileSync("./tests/data/revit/valid-revit-floor.json"));
            var isValid = validate(validFloor);
            expect(isValid).toEqual(true);
        });

        it ("Invalid revitFloor should fail", function() {
            var invalidFloor = JSON.parse(fs.readFileSync("./tests/data/revit/invalid-revit-floor.json"));
            var isValid = validate(invalidFloor);
            expect(isValid).toEqual(false);
        });
    });

    describe("revit-one-level-familyinstance schema", function() {
        var schemaId = "fluxRevit#/revitOneLevelFamilyInstance";
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
        var schemaId = "fluxRevit#/revitTwoLevelFamilyInstance";
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
        var schemaId = "fluxRevit#/revitOneLevelHostedFamilyInstance";
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
