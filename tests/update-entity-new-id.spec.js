describe("DCMScene/updateEntity/UpdatePointWithoutId", function() {
    'use strict';

    var modeling = require("../index").modeling({genId:require("../index").uuid.v4});

    // Test data
    var pt = modeling.entities.point([1, 1, 0]);
    var point = JSON.parse(JSON.stringify(pt));


    it ("If somehow there is entity without an id in its data in scene, updated entity should still have an id", function() {
        var scene = modeling.dcmScene();
        scene.add(pt);

        // Check scene has 1 entity
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(1);

        // Delete id fron point's data
        delete(scene.entities[Object.keys(scene.entities)[0]].id);
        expect(scene.entities[Object.keys(scene.entities)[0]].id).toBeUndefined();

        // After update newPoint should have valid new id in its data
        var newPoint = scene.updateEntity(point);
        expect(newPoint).toBeDefined();
        expect(newPoint.id).toBeDefined();
        expect(newPoint.id).not.toEqual(point.id);
    });
});