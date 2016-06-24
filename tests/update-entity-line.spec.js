describe("DCMScene/updateEntity/Line", function() {
    'use strict';

    var modeling = require("../index").modeling({genId:require("../index").uuid.v4});

    // Test data
    var start = modeling.entities.point([1, 1, 0]);
    var end = modeling.entities.point([10, 12, 0]);
    var line = modeling.entities.line(start, end);

    it ("Update line", function() {
        var scene = modeling.dcmScene();
        scene.add(line);

        // Check scene has 3 entity
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(3);

        // Get old entities
        var oldStartId = start.id;
        var oldStart = ents[oldStartId];
        expect(oldStart).toBeDefined();
        var oldEndId = end.id;
        var oldEnd = ents[oldEndId];
        expect(oldEnd).toBeDefined();
        var oldLineId = line.id;
        var oldLineStartId = line.startId;
        var oldLineEndId = line.endId;
        var oldLine = ents[oldLineId];
        expect(oldLine).toBeDefined();

        // Get updated entities
        var newStart = scene.updateEntity(start);
        expect(newStart).toBeDefined();
        var newEnd = scene.updateEntity(end);
        expect(newEnd).toBeDefined();
        var newLine = scene.updateEntity(line);
        expect(newLine).toBeDefined();

        // Compare start points
        expect(newStart.id).not.toEqual(oldStartId);
        expect(newStart.point).toEqual(oldStart.point);
        expect(newStart.primitive).toEqual(oldStart.primitive);

        // Compare end points
        expect(newEnd.id).not.toEqual(oldEndId);
        expect(newEnd.point).toEqual(oldEnd.point);
        expect(newEnd.primitive).toEqual(oldEnd.primitive);

        // Compare lines
        expect(newLine.id).not.toEqual(oldLine.Id);
        expect(newLine.startId).not.toEqual(oldLineStartId);
        expect(newLine.endId).not.toEqual(oldLineEndId);
        expect(newLine.start).toEqual(oldLine.start);
        expect(oldLine.end).toEqual(oldLine.end);
        expect(oldLine.primitive).toEqual(oldLine.primitive);
    });
});