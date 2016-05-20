describe("Serialize test", function() {
    'use strict';
    var modeling = require("../index").modeling;

    it ("Scene should serialize to json", function() {
        var scene = modeling.scene();
        scene.add("resultId", {"origin":[0,0,0],"primitive":"sphere","radius":10});
        var tessOp = modeling.operations.tesselateStl("resultId",1);
        scene.add("resultId", tessOp);
        var sceneStr = JSON.stringify({'Scene':scene});
        var expectedStr = '{"Scene":{"Entities":{"resultId":{"origin":[0,0,0],"primitive":"sphere","radius":10}},"Operations":[{"name":"resultId","op":["tessellateStl","resultId",1]}]}}';
        expect(sceneStr).toEqual(expectedStr);
    });
});