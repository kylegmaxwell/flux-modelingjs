describe("DCMScene/addEntity/Line", function() {
    'use strict';

    var modeling = require("./dcm-test-modeling.js");

    // Test data
    var start = modeling.entities.point([1, 1, 0]);
    var end = modeling.entities.point([10, 10, 0]);
    var line = modeling.entities.line(start, end);

    it ("Adding line should also add its start and end points", function() {
        var scene = modeling.dcmScene();
        scene.add(line);

        // Check scene has 3 entities (line and its end points)
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(3);

        // Check start point
        var startId = start.__data__.id;
        expect(ents[startId]).toBeDefined();
        expect(ents[startId]).toEqual(start.toJSON());

        // Check end point
        var endId = end.__data__.id;
        expect(ents[endId]).toBeDefined();
        expect(ents[endId]).toEqual(end.toJSON());

        // Check line itself
        var lineId = line.__data__.id;
        expect(ents[lineId]).toBeDefined();
        expect(ents[lineId]).toEqual(line.toJSON());
    });

    it ("If line start point already in scene, add only end point and line itself", function() {
        var scene = modeling.dcmScene();

        // Add start point
        scene.add(start);

        // Check we have only 1 entity in scene
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(1);

        // Check start point
        var startId = start.__data__.id;
        expect(ents[startId]).toBeDefined();
        expect(ents[startId]).toEqual(start.toJSON());

        // Add line and check we have only 3 entities in scene
        scene.add(line);
        ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(3);

        // Check start point
        var startId = start.__data__.id;
        expect(ents[startId]).toBeDefined();
        expect(ents[startId]).toEqual(start.toJSON());

        // Check end point
        var endId = end.__data__.id;
        expect(ents[endId]).toBeDefined();
        expect(ents[endId]).toEqual(end.toJSON());

        // Check line itself
        var lineId = line.__data__.id;
        expect(ents[lineId]).toBeDefined();
        expect(ents[lineId]).toEqual(line.toJSON());
    });
});