describe("flux-bcf", function() {
    'use strict';

    var Ajv = require("ajv");
    var modeling = require('../dist/index.js');
    var fluxBCF = modeling.fluxBCF;
    var fluxBCFSchema = modeling.schema.fluxBCF;

    var ajv = Ajv({
        allErrors: true
    });

    ajv.addSchema(fluxBCFSchema, "fluxBCF");


    describe("Flux BCF topic schema", function() {

        var schemaId = "fluxBCF#/topic";
        var validate = ajv.compile({ $ref: schemaId });

        it("Topic should validate", function() {
            var validTopic = require("./data/bcf/topic.json");
            var isValid = validate(validTopic);
            expect(true).toEqual(true);
        });

        it("Topic should require a GUID", function() {
            var malformedTopic = {
                "title": "My Very Important Issue",
                "creationDate":    "Tue Apr 25 2017 14:51:11 GMT-0700 (PDT)",
                "creationAuthor":  "bimManager@flux.io"
            };

            var isValid = validate(malformedTopic);
            expect(isValid).toEqual(false);
        });

        it("Topic should require a title", function() {
            var malformedTopic = {
                "guid": "58506757-1884-4A7C-A62E-F4046001BE31",
                "creationDate":    "Tue Apr 25 2017 14:51:11 GMT-0700 (PDT)",
                "creationAuthor":  "bimManager@flux.io"
            };

            var isValid = validate(malformedTopic);
            expect(isValid).toEqual(false);
        });

        it("Topic should require a creation date", function() {
            var malformedTopic = {
                "guid": "58506757-1884-4A7C-A62E-F4046001BE31",
                "title": "My Very Important Issue",
                "creationAuthor":  "bimManager@flux.io"
            };

            var isValid = validate(malformedTopic);
            expect(isValid).toEqual(false);
        });

        it("Topic should require a creation author", function() {
            var malformedTopic = {
                "guid": "58506757-1884-4A7C-A62E-F4046001BE31",
                "title": "My Very Important Issue",
                "creationDate":    "Tue Apr 25 2017 14:51:11 GMT-0700 (PDT)"
            };

            var isValid = validate(malformedTopic);
            expect(isValid).toEqual(false);
        });

        it("Topic should not validate with malformed data", function() {
            var malformedTopic = {
                "guid": "58506757-1884-4A7C-A62E-F4046001BE31",
                "topicType": "not a valid topic type",
                "topicStatus": "not a valid status",
                "title": "My Very Important Issue",
                "description": "Bacon ipsum dolor amet chuck sausage beef ribs, fatback doner.",
                "creationDate": "Tue Apr 25 2017 14:51:11 GMT-0700 (PDT)",
                "creationAuthor": "bimManager@flux.io",
                "modifiedDate": "Tue Apr 25 2017 14:51:11 GMT-0700 (PDT)",
                "modifiedAuthor": "structuralEngineer@flux.io",
                "bimSnippet": { "reference": [ "file1.rvt", "file2.rvt" ] }
            };

            var isValid = validate(malformedTopic);
            expect(isValid).toEqual(false);

        });

    });

    describe("Flux BCF viewpoint schema", function() {

        var schemaId = "fluxBCF#/viewpoint";
        var validate = ajv.compile({ $ref: schemaId });

        it("Viewpoint should validate", function() {
            var validViewpoint = require("./data/bcf/viewpoint-ortho.json");
            var isValid = validate(validViewpoint);
            expect (isValid).toEqual(true);
        });

        it("Viewpoint should require a GUID", function() {
            var malformedViewpoint = {
                "perspectiveCamera": {
                    "cameraViewPoint": { "x": 100, "y": 200, "z":150 },
                    "cameraDirection": { "x": 0, "y": 1, "z": 0 },
                    "camera_upVector": { "x": 0, "y": 0, "z": 1 },
                    "fieldOfView": 120
                }
            };
            var isValid = validate(malformedViewpoint);
            expect(isValid).toEqual(false);
        });

        it("Orthographic camera viewpoint should validate with required fields", function() {
            var validViewpoint = require("./data/bcf/viewpoint-ortho.json");
            var isValid = validate(validViewpoint);
            expect(isValid).toEqual(true);
        });

        it("Perspective camera viewpoint should validate with required fields", function() {
            var validViewpoint = require("./data/bcf/viewpoint-perspective.json");
            var isValid = validate(validViewpoint);
            expect(isValid).toEqual(true);
        });


        describe("Flux BCF Orthographic camera schema", function() {

            var cameraSchema = "fluxBCF#/viewDefinitions/orthogonalCamera";
            var cameraValidate = ajv.compile({ $ref: cameraSchema });

            it("Orthographic camera should not validate if required fields are missing", function() {
                var malformedCamera = {
                    "cameraDirection": { x: 0, y: 1, z: 0},
                    "cameraUpVector": {  x: 0, y:0, z: 0},
                    "viewToWorldScale": 50
                };
                var isValid = cameraValidate(malformedCamera);
                expect(isValid).toEqual(false);

                malformedCamera = {
                    "cameraViewPoint": { x: 100, y: 100, z:100 },
                    "cameraUpVector": {  x: 0, y:0, z: 0},
                    "viewToWorldScale": 50
                };
                isValid = cameraValidate(malformedCamera);
                expect(isValid).toEqual(false);


                malformedCamera = {
                    "cameraViewPoint": { x: 100, y: 100, z:100 },
                    "cameraDirection": { x: 0, y: 1, z: 0},
                    "viewToWorldScale": 50
                };
                isValid = cameraValidate(malformedCamera);
                expect(isValid).toEqual(false);


                malformedCamera = {
                    "cameraViewPoint": { x: 100, y: 100, z:100 },
                    "cameraDirection": { x: 0, y: 1, z: 0},
                    "cameraUpVector": {  x: 0, y:0, z: 0},
                };
                isValid = cameraValidate(malformedCamera);
                expect(isValid).toEqual(false);
            });
        });


        describe("Flux BCF Perspective camera schema", function() {

            var cameraSchema = "fluxBCF#/viewDefinitions/perspectiveCamera";
            var cameraValidate = ajv.compile({ $ref: cameraSchema });

            it("Perspective camera should not validate if required fields are missing", function() {
                var malformedCamera = {
                    "cameraDirection": { x: 0, y: 1, z: 0},
                    "cameraUpVector": { x: 0, y: 0, z: 1},
                    "fieldOfView": 120
                };
                var isValid = cameraValidate(malformedCamera);
                expect(isValid).toEqual(false);

                malformedCamera = {
                    "cameraViewPoint": {x: 100, y: 100, z: 0},
                    "cameraUpVector": { x: 0, y: 0, z: 1},
                    "fieldOfView": 120
                };
                isValid = cameraValidate(malformedCamera);
                expect(isValid).toEqual(false);

                malformedCamera = {
                    "cameraViewPoint": {x: 100, y: 100, z: 0},
                    "cameraDirection": { x: 0, y: 1, z: 0},
                    "fieldOfView": 120
                };
                isValid = cameraValidate(malformedCamera);
                expect(isValid).toEqual(false);

                malformedCamera = {
                    "cameraViewPoint": {x: 100, y: 100, z: 0},
                    "cameraDirection": { x: 0, y: 1, z: 0},
                    "cameraUpVector": { x: 0, y: 0, z: 1},
                };
                isValid = cameraValidate(malformedCamera);
                expect(isValid).toEqual(false);
            });
        });

    });
});