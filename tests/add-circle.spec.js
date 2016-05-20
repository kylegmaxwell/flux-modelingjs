describe("DCMScene/addEntity/Circle", function() {
    'use strict';

    var modeling = require("./dcm-test-modeling");

    // Test data
    var origin = modeling.entities.point([1, 1, 0]);
    var radius = 10;
    var circle = modeling.entities.circle(origin, radius);

    it ("Adding circle should also add its origin point", function() {
        var scene = modeling.dcmScene();
        scene.add(circle);

        // Check scene has 2 entities (circle and its origin point)
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(2);

        // Check origin point
        var originId = origin.__data__.id;
        expect(ents[originId]).toBeDefined();
        expect(ents[originId]).toEqual(origin.toJSON());

        // Check circle itself
        var circleId = circle.__data__.id;
        expect(ents[circleId]).toBeDefined();
        expect(ents[circleId]).toEqual(circle.toJSON());
    });

    it ("If circle origin point already in scene, add only circle", function() {
        var scene = modeling.dcmScene();

        // Add origin point
        scene.add(origin);

        // Check we have only 1 entity in scene
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(1);

        // Check origin point
        var originId = origin.__data__.id;
        expect(ents[originId]).toBeDefined();
        expect(ents[originId]).toEqual(origin.toJSON());

        // Add circle and check we have only 2 entities in scene
        scene.add(circle);
        ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(2);

        // Check origin point
        var originId = origin.__data__.id;
        expect(ents[originId]).toBeDefined();
        expect(ents[originId]).toEqual(origin.toJSON());

        // Check circle itself
        var circleId = circle.__data__.id;
        expect(ents[circleId]).toBeDefined();
        expect(ents[circleId]).toEqual(circle.toJSON());
    });
});