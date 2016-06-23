describe("DCMScene/addEntity/Arc", function() {
    'use strict';

    var modeling = require("../index").modeling({genId:require("../index").uuid.v4});

    // Test data
    var start = modeling.entities.point([0, 1, 0]);
    var end = modeling.entities.point([10, 1, 0]);
    var mid = modeling.entities.point([5, -4, 0]);
    var origin = modeling.entities.point([5, 1, 0]);
    var arc = modeling.entities.arc(start, mid, end);

    it ("Adding arc should also add its start, end and origin points", function() {
        var scene = modeling.dcmScene();
        scene.add(arc);

        // Check scene has 4 entities (arc, its end and origin points)
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(4);

        // Check start point
        var startId = start.__data__.id;
        expect(ents[startId]).toBeDefined();
        expect(ents[startId]).toEqual(start.toJSON());

        // Check end point
        var endId = end.__data__.id;
        expect(ents[endId]).toBeDefined();
        expect(ents[endId]).toEqual(end.toJSON());

        // Check origin point
        // It will be given new guid so just copy it
        var originId = arc.toJSON().originId;
        expect(ents[originId]).toBeDefined();
        origin.__data__.id = originId;
        expect(ents[originId]).toEqual(origin.toJSON());

        // Check arc itself
        var arcId = arc.__data__.id;
        expect(ents[arcId]).toBeDefined();
        expect(ents[arcId]).toEqual(arc.toJSON());
    });

    it ("If arc start point already in scene, add only end, origin and arc itself", function() {
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

        // Add arc and check we have only 4 entities in scene
        scene.add(arc);
        ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(4);

        // Check start point
        var startId = start.__data__.id;
        expect(ents[startId]).toBeDefined();
        expect(ents[startId]).toEqual(start.toJSON());

        // Check end point
        var endId = end.__data__.id;
        expect(ents[endId]).toBeDefined();
        expect(ents[endId]).toEqual(end.toJSON());

        // Check origin point
        // It will be given new guid so just copy it
        var originId = arc.toJSON().originId;
        expect(ents[originId]).toBeDefined();
        origin.__data__.id = originId;
        expect(ents[originId]).toEqual(origin.toJSON());

        // Check arc itself
        var arcId = arc.__data__.id;
        expect(ents[arcId]).toBeDefined();
        expect(ents[arcId]).toEqual(arc.toJSON());
    });
});