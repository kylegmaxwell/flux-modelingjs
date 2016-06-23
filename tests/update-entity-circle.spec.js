describe("DCMScene/updateEntity/Circle", function() {
    'use strict';

    var modeling = require("../index").modeling({genId:require("../index").uuid.v4});

    // Test data
    var origin = modeling.entities.point([1, 1, 0]);
    var radius = 10;
    var circle = modeling.entities.circle(origin, radius);

    it ("Update circle", function() {
        var scene = modeling.dcmScene();
        scene.add(circle);

        // Check scene has 2 entity
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(2);

        // Get old entities
        var oldOriginId = origin.toJSON().id;
        var oldOrigin = ents[oldOriginId];
        expect(oldOrigin).toBeDefined();

        var oldCircleId = circle.toJSON().id;
        var oldCircleOriginId = circle.toJSON().originId;
        var oldCircle = ents[oldCircleId];
        expect(oldCircle).toBeDefined();

        // Get updated entities
        var newOrigin = scene.updateEntity(origin);
        expect(newOrigin).toBeDefined();
        newOrigin = newOrigin.toJSON();

        var newCircle = scene.updateEntity(circle);
        expect(newCircle).toBeDefined();
        newCircle = newCircle.toJSON();

        // Compare origin points
        expect(newOrigin.id).not.toEqual(oldOriginId);
        expect(newOrigin.point).toEqual(oldOrigin.point);
        expect(newOrigin.primitive).toEqual(oldOrigin.primitive);

        // Compare circles
        expect(newCircle.id).not.toEqual(oldCircle.Id);
        expect(newCircle.originId).not.toEqual(oldCircleOriginId);
        expect(newCircle.origin).toEqual(oldCircle.origin);
        expect(oldCircle.primitive).toEqual(oldCircle.primitive);
    });
});