describe("DCMScene/updateEntity/Arc", function() {
    'use strict';

    var modeling = require("../index").modeling();

    // Test data
    var start = modeling.entities.point([0, 1, 0]);
    var end = modeling.entities.point([10, 1, 0]);
    var mid = modeling.entities.point([5, -4, 0]);
    var origin = modeling.entities.point([5, 1, 0]);
    var arc = modeling.entities.arc(start, mid, end);

    it ("Update Arc", function() {
        var scene = modeling.dcmScene();
        scene.add(arc);

        // Check scene has 4 entity
        var ents = scene.toJSON().Entities;
        expect(ents).toBeDefined();
        expect(Object.keys(ents).length).toEqual(4);

        // Get old entities
        var oldStartId = start.toJSON().id;
        var oldStart = ents[oldStartId];
        expect(oldStart).toBeDefined();
        var oldEndId = end.toJSON().id;
        var oldEnd = ents[oldEndId];
        expect(oldEnd).toBeDefined();
        var oldArcId = arc.toJSON().id;
        var oldArcStartId = arc.toJSON().startId;
        var oldArcEndId = arc.toJSON().endId;
        var oldArcOriginId = arc.toJSON().originId;
        var oldArc = ents[oldArcId];
        expect(oldArc).toBeDefined();
        var oldOriginId = oldArc.originId;
        var oldOrigin = ents[oldOriginId];
        expect(oldOrigin).toBeDefined();

        // Get updated entities
        var newStart = scene.updateEntity(start);
        expect(newStart).toBeDefined();
        newStart = newStart.toJSON();
        var newEnd = scene.updateEntity(end);
        expect(newEnd).toBeDefined();
        newEnd = newEnd.toJSON();
        var newArc = scene.updateEntity(arc);
        expect(newArc).toBeDefined();
        newArc = newArc.toJSON();
        var newOrigin = scene.updateEntity(oldOrigin);
        expect(newOrigin).toBeDefined();
        newOrigin = newOrigin.toJSON();

        // Compare start points
        expect(newStart.id).not.toEqual(oldStartId);
        expect(newStart.point).toEqual(oldStart.point);
        expect(newStart.primitive).toEqual(oldStart.primitive);

        // Compare end points
        expect(newEnd.id).not.toEqual(oldEndId);
        expect(newEnd.point).toEqual(oldEnd.point);
        expect(newEnd.primitive).toEqual(oldEnd.primitive);

        // Compare arcs
        expect(newArc.id).not.toEqual(oldArc.Id);
        expect(newArc.startId).not.toEqual(oldArcStartId);
        expect(newArc.endId).not.toEqual(oldArcEndId);
        expect(newArc.originId).not.toEqual(oldArcOriginId);
        expect(newArc.start).toEqual(oldArc.start);
        expect(oldArc.end).toEqual(oldArc.end);
        expect(oldArc.primitive).toEqual(oldArc.primitive);

        // Compare origin points
        expect(newOrigin.id).not.toEqual(oldOriginId);
        expect(newOrigin.point).toEqual(oldOrigin.point);
        expect(newOrigin.primitive).toEqual(oldOrigin.primitive);
    });
});