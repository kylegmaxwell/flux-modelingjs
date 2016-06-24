describe("DCMScene/addEntity/Ellipse", function() {
    'use strict';

    var modeling = require("../index").modeling({genId:require("../index").uuid.v4});

    // Test data
    var origin = modeling.entities.point([1, 1, 0]);
    var minRadius = 10;
    var majRadius = 20;
    var dir = [1, 0, 0];
    var ellipse = modeling.entities.ellipse(origin, majRadius, minRadius, dir);

    it ("Adding ellipse should also add its origin point", function() {
        var scene = modeling.dcmScene();
        scene.add(ellipse);

        // Check scene has 2 entities (ellipse and its origin point)
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(2);

        // Check origin point
        var originId = origin.id;
        expect(ents[originId]).toBeDefined();
        expect(ents[originId]).toEqual(origin);

        // Check ellipse itself
        var ellipseId = ellipse.id;
        expect(ents[ellipseId]).toBeDefined();
        expect(ents[ellipseId]).toEqual(ellipse);
    });

    it ("If ellipse origin point already in scene, add only ellipse", function() {
        var scene = modeling.dcmScene();

        // Add origin point
        scene.add(origin);

        // Check we have only 1 entity in scene
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(1);

        // Check origin point
        var originId = origin.id;
        expect(ents[originId]).toBeDefined();
        expect(ents[originId]).toEqual(origin);

        // Add ellipse and check we have only 2 entities in scene
        scene.add(ellipse);
        ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(2);

        // Check origin point
        var originId = origin.id;
        expect(ents[originId]).toBeDefined();
        expect(ents[originId]).toEqual(origin);

        // Check ellipse itself
        var ellipseId = ellipse.id;
        expect(ents[ellipseId]).toBeDefined();
        expect(ents[ellipseId]).toEqual(ellipse);
    });
});