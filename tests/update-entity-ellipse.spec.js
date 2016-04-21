describe("DCMScene/updateEntity/Ellipse", function() {
    'use strict';

    var modeling = require("./dcm-test-modeling.js");

    // Test data
    var origin = modeling.entities.point([1, 1, 0]);
    var minRadius = 10;
    var majRadius = 20;
    var dir = [1, 0, 0];
    var ellipse = modeling.entities.ellipse(origin, majRadius, minRadius, dir);

    it ("Update ellipse", function() {
        var scene = modeling.dcmScene();
        scene.add(ellipse);

        // Check scene has 2 entity
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(2);

        // Get old entities
        var oldOriginId = origin.toJSON().id;
        var oldOrigin = ents[oldOriginId];
        expect(oldOrigin).toBeDefined();

        var oldEllipseId = ellipse.toJSON().id;
        var oldEllipseOriginId = ellipse.toJSON().originId;
        var oldEllipse = ents[oldEllipseId];
        expect(oldEllipse).toBeDefined();

        // Get updated entities
        var newOrigin = scene.updateEntity(origin);
        expect(newOrigin).toBeDefined();
        newOrigin = newOrigin.toJSON();

        var newEllipse = scene.updateEntity(ellipse);
        expect(newEllipse).toBeDefined();
        newEllipse = newEllipse.toJSON();

        // Compare origin points
        expect(newOrigin.id).not.toEqual(oldOriginId);
        expect(newOrigin.point).toEqual(oldOrigin.point);
        expect(newOrigin.primitive).toEqual(oldOrigin.primitive);

        // Compare ellipses
        expect(newEllipse.id).not.toEqual(oldEllipse.Id);
        expect(newEllipse.originId).not.toEqual(oldEllipseOriginId);
        expect(newEllipse.origin).toEqual(oldEllipse.origin);
        expect(newEllipse.direction).toEqual(oldEllipse.direction);
        expect(oldEllipse.primitive).toEqual(oldEllipse.primitive);
    });
});