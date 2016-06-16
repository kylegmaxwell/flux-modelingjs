describe("DCMScene/updateEntity/Point", function() {
    'use strict';

    var modeling = require("../index").modeling();

    // Test data
    var point = modeling.entities.point([1, 1, 0]);

    it ("Update point", function() {
        var scene = modeling.dcmScene();
        scene.add(point);

        // Check scene has 1 entity
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(1);

        var id = point.toJSON().id;
        var oldPoint = ents[id];

        var newPoint = scene.updateEntity(point);
        expect(newPoint).toBeDefined();
        newPoint = newPoint.toJSON();

        // Expect new id in updated point
        expect(newPoint.id).not.toEqual(id);
        expect(oldPoint.point).toEqual(newPoint.point);
        expect(oldPoint.primitive).toEqual(oldPoint.primitive);
    });
});