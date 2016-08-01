describe("Query/Entity", function () {
    var flux = require("../index");
    var modeling = flux.modeling();

    it("should add Entity's attribute with addAttribute", function () {
        var point = modeling.entities.point([2, 0.5, 4]);
        expect(typeof point.attributes).toBe('undefined');
        expect(typeof point.attribute).toBe('undefined');
        expect(typeof point.addAttribute).toBe('function');

        point.addAttribute(modeling.attributes.material().setColor(128, 128, 128));
        expect(typeof point.attributes).toBe('object');
        expect(typeof point.attribute).toBe('undefined');
        expect(typeof point.addAttribute).toBe('function');
    });

    it("should set body's axis with setAxis", function () {
        var point = modeling.entities.point([2, 0.5, 4]);
        expect(typeof point.setAxis).toBe('function');
        point.setAxis([1, 0, 1]);
        expect(typeof point.setAxis).toBe('function');
        expect(typeof point.axis).toBe('object');
    });

    it("should set body's reference with setReference", function () {
        var point = modeling.entities.point([2, 0.5, 4]);
        expect(typeof point.setReference).toBe('function');
        point.setReference([1, 0, 1]);
        expect(typeof point.setReference).toBe('function');
        expect(typeof point.reference).toBe('object');
    });

    it("should add vertices to mesh via addVertex/addVertices", function () {
        var mesh = modeling.entities.mesh();
        expect(typeof mesh.addVertex).toBe('function');
        expect(typeof mesh.addVertices).toBe('function');

        mesh.addVertex([0, 1, 2]);
        mesh.addVertices(
            [ 0, 2, 1],
            [ 1, 2, 2],
            [ 4, 3, 8]
        );
        expect(typeof mesh.addVertex).toBe('function');
        expect(typeof mesh.addVertices).toBe('function');
        expect(typeof mesh.vertices).toBe('object');
    });

    it("should add faces to mesh via addFace/addFaces", function () {
        var mesh = modeling.entities.mesh();
        expect(typeof mesh.addFace).toBe('function');
        expect(typeof mesh.addFaces).toBe('function');

        mesh.addFace([0, 1, 2]);
        mesh.addFaces(
            [ 0, 2, 1],
            [ 1, 2, 2],
            [ 4, 3, 8]
        );
        expect(typeof mesh.addFace).toBe('function');
        expect(typeof mesh.addFaces).toBe('function');
        expect(typeof mesh.faces).toBe('object');
    });

    it("should add knots to curve via addKnots", function () {
        var curve = modeling.entities.curve(0);
        expect(typeof curve.addKnots).toBe('function');
        curve.addKnots(0, 0, 1, 1);
        expect(typeof curve.addKnots).toBe('function');
        expect(typeof curve.knots).toBe('object');
    });

    it("should add vertices to curve via addVertex, addVertices", function () {
        var curve = modeling.entities.curve(0);
        expect(typeof curve.addVertex).toBe('function');
        expect(typeof curve.addVertices).toBe('function');
        curve.addVertex([0, 0, 1]);
        curve.addVertices(
            [0, 2, 1],
            [4, 3, 0]
        );
        expect(typeof curve.addVertex).toBe('function');
        expect(typeof curve.addVertices).toBe('function');
        expect(typeof curve.controlPoints).toBe('object');
    });

    it("adds knots to surface via addUKnots, addVKnots", function () {
        var surf = modeling.entities.surface(0, 0);
        expect(typeof surf.addUKnots).toBe('function');
        expect(typeof surf.addVKnots).toBe('function');

        surf.addUKnots(0, 0, 1, 1).addVKnots(0, 0, 1, 1);
        expect(typeof surf.addUKnots).toBe('function');
        expect(typeof surf.addVKnots).toBe('function');
        expect(typeof surf.uKnots).toBe('object');
        expect(typeof surf.vKnots).toBe('object');
    });

    it("adds vertices to surface via addRow, addPoints", function () {
        var surf = modeling.entities.surface(0, 0);
        expect(typeof surf.addRow).toBe('function');
        expect(typeof surf.addPoints).toBe('function');

        surf
        .addRow([0, 0, 0], [0, 1, 0])
        .addPoints(
            [ [1, 0, 0], [1, 1, 1] ]
        );
        expect(typeof surf.addRow).toBe('function');
        expect(typeof surf.addPoints).toBe('function');
        expect(typeof surf.controlPoints).toBe('object');
    });

    it("sets material properties via set* methods", function () {
        var m = modeling.attributes.material();
        expect(typeof m.setAmbient).toBe('function');
        expect(typeof m.setDiffuse).toBe('function');
        expect(typeof m.setSpecular).toBe('function');
        expect(typeof m.setPower).toBe('function');
        expect(typeof m.setColor).toBe('function');

        m
        .setAmbient(0, 0, 0)
        .setDiffuse(0, 0, 0)
        .setSpecular(0, 0, 0)
        .setPower(0.5)
        .setColor(0, 128, 0);

        expect(typeof m.setAmbient).toBe('function');
        expect(typeof m.setDiffuse).toBe('function');
        expect(typeof m.setSpecular).toBe('function');
        expect(typeof m.setPower).toBe('function');
        expect(typeof m.setColor).toBe('function');

        expect(typeof m.ambient).toBe('object');
        expect(typeof m.diffuse).toBe('object');
        expect(typeof m.specular).toBe('object');
        expect(typeof m.power).toBe('number');
    });
});
