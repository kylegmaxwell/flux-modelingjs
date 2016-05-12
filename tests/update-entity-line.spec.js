describe("DCMScene/updateEntity/Line", function() {
    'use strict';

    var modeling = require("./dcm-test-modeling.js");

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
        var oldStartId = start.toJSON().id;
        var oldStart = ents[oldStartId];
        expect(oldStart).toBeDefined();
        var oldEndId = end.toJSON().id;
        var oldEnd = ents[oldEndId];
        expect(oldEnd).toBeDefined();
        var oldLineId = line.toJSON().id;
        var oldLineStartId = line.toJSON().startId;
        var oldLineEndId = line.toJSON().endId;
        var oldLine = ents[oldLineId];
        expect(oldLine).toBeDefined();

        // Get updated entities
        var newStart = scene.updateEntity(start);
        expect(newStart).toBeDefined();
        newStart = newStart.toJSON();
        var newEnd = scene.updateEntity(end);
        expect(newEnd).toBeDefined();
        newEnd = newEnd.toJSON();
        var newLine = scene.updateEntity(line);
        expect(newLine).toBeDefined();
        newLine = newLine.toJSON();

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