describe("DCMScene/addEntity/Point", function() {
    'use strict';

    var modeling = require("../index").modeling({genId:require("../index").uuid});

    // Test data
    var point = modeling.entities.point([1, 1, 0]);

    it ("Add point", function() {
        var scene = modeling.dcmScene();
        scene.add(point);

        // Check scene has 1 entity
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(1);

        // Check point
        var id = point.__data__.id;
        expect(ents[id]).toBeDefined();
        expect(ents[id]).toEqual(point.toJSON());
    });
});