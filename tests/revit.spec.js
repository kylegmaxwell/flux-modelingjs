/** Converts object to its JSON representation
 *  Used because of:
 *  1. Jasmine's toEqual seems to be comparing not only JSON-like fields,
 *      but other types of object fields. This results in two objects,
 *      whose representations should  be equal, to be considered inequal.
 *  2. JSON.stringify is the only place where it's correct to use .toJSON
 *      contract. Other cases should consider possible absense of that method,
 *      and also comparison or not comparison of non-JSON types. Becomes
 *      complicated too quickly.
 *  3. As a result of refactoring, some types from modelingjs have lost their
 *      .toJSON method. Then, due to p.2, that would be the only proper way
 *      to compare their JSON representations.
 */
function forceJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}

describe("revit test", function () {
    'use strict';
    var modeling = require('../dist/index.js');
    var revit = modeling.revit;

    describe("createElement", function() {
        var info = {
            category: "foo",
            family: "bar",
            type: "zob",
            placementType: "Invalid"
        };

        it("should return error if familyInfo is not provided.", function () {
            var el = revit.createElement({}, {}, {}, {});
            expect(el.Error).toBeDefined();
        });

        it("should return error if invalid familyInfo provided.", function () {
            var el = revit.createElement({Category: "foo"}, {}, {}, {}, {});
            expect(el.Error).toBeDefined();
        });

        it("should fail if non-map passed for parameters", function () {
            var el = revit.createElement(info, "a");
            expect(el.Error).toBeDefined();
        });

        it("should work.", function () {
            var el = revit.createElement("Id-1", info, {}, {}, {}, {});
            expect(el).toEqual({Out: {primitive: "revitElement", fluxId: "Id-1",
                familyInfo: info, geometryParameters: {},
                instanceParameters: {}, typeParameters: {},
                customParameters: {}}});
        });

        it("should work if fluxId is a number.", function () {
            var el = revit.createElement(12345, info, {}, {}, {}, {});
            expect(el).toEqual({Out: {primitive: "revitElement", fluxId: String(12345),
                familyInfo: info, geometryParameters: {},
                instanceParameters: {}, typeParameters: {},
                customParameters: {}}});
        });

        it("should work if fluxId is not provided", function() {
            var el = revit.createElement(undefined, info, {}, {}, {}, {});
            expect(el).toEqual({Out: {primitive: "revitElement", fluxId: null,
                familyInfo: info, geometryParameters: {},
                instanceParameters: {}, typeParameters: {},
                customParameters: {}}});
        });
    });

    describe("createModelLine", function() {
        var fluxId = "FluxId-1";
        var curve = {
            "primitive": "line",
            "start": [ 0.0, 0.0, 0.0],
            "end": [10.0, 0.0, 0.0]
        };

        it("should return error if required parameters are not provided.", function () {
            var el = revit.createModelLine(fluxId, undefined);
            expect(el.Error).toBeDefined();
        });

        it("should work.", function () {
            var el = revit.createModelLine(fluxId, curve);
            expect(el).toEqual({
                Out: {
                    primitive: "revitElement",
                    fluxId: fluxId,
                    familyInfo: {
                        category: "Lines",
                        family: "ModelCurve",
                        type: "",
                        placementType: "Invalid"
                    },
                    geometryParameters: {
                        curve: curve
                    },
                    instanceParameters: {
                    },
                    typeParameters: {
                    },
                    customParameters: {
                    }
                }
            });
        });
    });

    describe("createReferencePlane", function() {
        var fluxId = "FluxId-1";
        var bubbleEnd = [1.0, 0.0, 0.0];
        var freeEnd = [10.0, 0.0,0.0];
        var cutVector = [0.0, 1.0, 0.0];

        it("should return error if required parameters are not provided.", function () {
            var el = revit.createReferencePlane(fluxId, undefined, freeEnd, cutVector, "RefPlane-1", false);
            expect(el.Error).toBeDefined();

            el = revit.createReferencePlane(fluxId, bubbleEnd, undefined, cutVector, "RefPlane-1", false);
            expect(el.Error).toBeDefined();

            el = revit.createReferencePlane(fluxId, bubbleEnd, freeEnd, undefined, "RefPlane-1", false);
            expect(el.Error).toBeDefined();
        });

        it("should work.", function () {
            var el = revit.createReferencePlane(fluxId, bubbleEnd, freeEnd, cutVector, "RefPlane-1", false);
            expect(forceJSON(el)).toEqual(forceJSON({
                Out: {
                    primitive: "revitElement",
                    fluxId: fluxId,
                    familyInfo: {
                        category: "Reference Planes",
                        family: "ReferencePlane",
                        type: "",
                        placementType: "Invalid"
                    },
                    geometryParameters: {
                        bubbleEnd: modeling.geometry.point(bubbleEnd),
                        freeEnd: modeling.geometry.point(freeEnd),
                        cutVector: modeling.geometry.vector(cutVector),
                        name: "RefPlane-1",
                        wallClosure: false
                    },
                    instanceParameters: {
                    },
                    typeParameters: {
                    },
                    customParameters: {
                    }
                }
            }));
        });
    });

    describe("createRoom", function() {
        var fluxId = "FluxId-1";
        var level = "Level-1";
        var location = modeling.geometry.point([1,1,1]);
        var name = "Room-1";
        var instanceParamMap = {i1:"InstanceParam 1", i2:"InstanceParam 2"};
        var customParamMap = {c1: "CustomParam 1", c2:"CustomParam 2"};

        it("should return error if required parameters are not provided.", function () {
            var el = revit.createRoom(fluxId, undefined, level, name, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();

            var el = revit.createRoom(fluxId, location, undefined, name, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();

            el = revit.createRoom(fluxId, location, level, undefined, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
        });

        it("should work", function () {
            var el = revit.createRoom(fluxId, location, level, name, instanceParamMap, customParamMap);
            expect(forceJSON(el)).toEqual(forceJSON({
                Out: {
                    primitive: "revitElement",
                    fluxId: fluxId,
                    familyInfo: {
                        category: "Rooms",
                        family: "Room",
                        type: "",
                        placementType: "Invalid"
                    },
                    geometryParameters: {
                        "uv": modeling.geometry.point(location),
                        "level": level,
                        "name": name
                    },
                    instanceParameters: {
                        i1:"InstanceParam 1",
                        i2:"InstanceParam 2"
                    },
                    typeParameters: {
                    },
                    customParameters: {
                        c1:"CustomParam 1",
                        c2:"CustomParam 2"
                    }
                }
            }));
        });
    });

    describe("createLevel", function() {
        var instanceParamMap = {i1:"InstanceParam 1", i2:"InstanceParam 2"};
        var customParamMap = {c1: "CustomParam 1", c2:"CustomParam 2"};

        it("should return error if required parameters are not provided.", function () {
            var el = revit.createLevel("Id-1", undefined, 3, "Level-1",
                instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();

            el = revit.createLevel("Id-1", "LevelType-1", undefined,
                "Level-1", instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();

            el = revit.createLevel("Id-1", "LevelType-1", 10, undefined,
                instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
        });

        it("should work.", function () {
            var el = revit.createLevel("Id-1", "LevelType-1", 10, "Level-1",
                instanceParamMap, customParamMap);
            expect(el).toEqual({
                Out: {
                    primitive: "revitElement",
                    fluxId: "Id-1",
                    familyInfo: {
                        category: "Levels",
                        family: "Level",
                        type: "LevelType-1",
                        placementType: "Invalid"
                    },
                    geometryParameters: {
                        name: "Level-1",
                        elevation: 10
                    },
                    instanceParameters: {
                        i1:"InstanceParam 1",
                        i2:"InstanceParam 2"
                    },
                    typeParameters: {
                    },
                    customParameters: {
                        c1:"CustomParam 1",
                        c2:"CustomParam 2"
                    }
                }
            });
        });

        it("should work if optional parameters are not provided", function() {
            var el = revit.createLevel(undefined, "LevelType-1", 10,
                "Level-1", undefined, undefined);
            expect(el).toEqual({
                Out: {
                    primitive: "revitElement",
                    fluxId: null,
                    familyInfo: {
                        category: "Levels",
                        family: "Level",
                        type: "LevelType-1",
                        placementType: "Invalid"
                    },
                    geometryParameters: {
                        name: "Level-1",
                        elevation: 10
                    },
                    instanceParameters: {
                    },
                    typeParameters: {
                    },
                    customParameters: {
                    }
                }
            });
        });
    });

    describe("createGrid", function() {
        var instanceParamMap = {i1:"InstanceParam 1", i2:"InstanceParam 2"};
        var customParamMap = {c1: "CustomParam 1", c2:"CustomParam 2"};
        var gridCurve = {
            "primitive": "line",
            "start": [ 0.0, 0.0, 0.0],
            "end": [10.0, 0.0, 0.0]
        };

        it("should work.", function () {
            var el = revit.createGrid("Id-1", "GridType-1", gridCurve, "Grid-1",
                instanceParamMap, customParamMap);
            expect(el).toEqual({
                Out: {
                    primitive: "revitElement",
                    fluxId: "Id-1",
                    familyInfo: {
                        category: "Grids",
                        family: "Grid",
                        type: "GridType-1",
                        placementType: "Invalid"
                    },
                    geometryParameters: {
                        name: "Grid-1",
                        curve: gridCurve
                    },
                    instanceParameters: {
                        i1:"InstanceParam 1",
                        i2:"InstanceParam 2"
                    },
                    typeParameters: {
                    },
                    customParameters: {
                        c1:"CustomParam 1",
                        c2:"CustomParam 2"
                    }
                }
            });
        });

        it("should return error if required parameters are not provided.", function () {
            var gridCurve = {
            "primitive": "line",
            "start": [ 0.0, 0.0, 0.0],
            "end": [10.0, 0.0, 0.0]
            };
            var el = revit.createGrid("Id-1", undefined, gridCurve, "grid-1",
                instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
            var el = revit.createGrid("Id-1", "GridType-1", undefined, "grid-1",
                instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
            var el = revit.createGrid("Id-1", "GridType-1", gridCurve, undefined,
                instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
        });

        it("should work if optional parameters are not provided", function() {
            var gridCurve = {
            "primitive": "line",
            "start": [ 0.0, 0.0, 0.0],
            "end": [10.0, 0.0, 0.0]
            };
            var el = revit.createGrid(undefined, "GridType-1", gridCurve, "Grid-1",
                undefined, undefined);
            expect(el).toEqual({
                 Out: {
                    primitive: "revitElement",
                    fluxId: null,
                    familyInfo: {
                        category: "Grids",
                        family: "Grid",
                        type: "GridType-1",
                        placementType: "Invalid"
                    },
                    geometryParameters: {
                        name: "Grid-1",
                        curve: gridCurve
                    },
                    instanceParameters: {
                    },
                    typeParameters: {
                    },
                    customParameters: {
                    }
                }
            });
        });
    });

    describe("createWall", function() {
        var instanceParamMap = {i1: "InstanceParam 1", i2: "InstanceParam 2"};
        var customParamMap = {c1:"CustomParam 1", c2:"CustomParam 2"};
        var profile = {};

        it("should return error if required parameters are not provided.", function () {
            var el = revit.createWall();
            expect(el.Error).toBeDefined();
            el = revit.createWall(undefined, undefined, "WallFamily",
                profile, "Level-1", false, false, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
            el = revit.createWall(undefined, "WallFamily", undefined,
                profile, "Level-1", false, false, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
            el = revit.createWall(undefined, "WallFamily", "WallFamily",
                undefined, "Level-1", false, false, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
        });

        it("should work.", function () {
            var el = revit.createWall("Id-1", "WallFamily-1",
                "WallType-1", profile, "Level-1", true, true, instanceParamMap, customParamMap);
            expect(el).toEqual({
                Out: {
                    primitive: "revitElement",
                    fluxId: "Id-1",
                    familyInfo: {
                        category: "Walls",
                        family: "WallFamily-1",
                        type: "WallType-1",
                        placementType: "Invalid"
                    },
                    geometryParameters: {
                        profile: {},
                        level: "Level-1",
                        structural: true,
                        flipped: true
                    },
                    instanceParameters: {
                        i1:"InstanceParam 1",
                        i2:"InstanceParam 2"
                    },
                    typeParameters: {
                    },
                    customParameters: {
                        c1:"CustomParam 1",
                        c2:"CustomParam 2"
                    }
                }
            });
        });
    });

    describe("createFloor", function() {
        var instanceParamMap = {i1: "InstanceParam 1", i2: "InstanceParam 2"};
        var customParamMap = {c1:"CustomParam 1", c2:"CustomParam 2"};
        var profile = [{
          "curves": [{
            "primitive":"line",
            "start":[0,20,30],
            "end":[20,30,40]
          }],
          "primitive": "polycurve"
        }];

        it("should return error if required parameters are not provided.", function () {
            var el = revit.createFloor();
            expect(el.Error).toBeDefined();
            el = revit.createFloor(undefined, undefined, profile, "Level-1", true, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
            el = revit.createFloor(undefined, "FloorType", undefined, "Level-1", true, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
        });

        it("should work.", function () {
            var el = revit.createFloor("Id-1", "FloorType-1", profile, "Level-1", true, instanceParamMap, customParamMap);
            expect(el).toEqual({
                Out: {
                    primitive: "revitElement",
                    fluxId: "Id-1",
                    familyInfo: {
                        category: "Floors",
                        family: "Floor",
                        type: "FloorType-1",
                        placementType: "Invalid"
                    },
                    geometryParameters: {
                        profile: profile,
                        level: "Level-1",
                        structural: true
                    },
                    instanceParameters: {
                        i1:"InstanceParam 1",
                        i2:"InstanceParam 2"
                    },
                    typeParameters: {
                    },
                    customParameters: {
                        c1:"CustomParam 1",
                        c2:"CustomParam 2"
                    }
                }
            });
        });
    });

    describe("createOneLevelFamilyInstance", function() {
        var instanceParamMap = {i1: "InstanceParam 1", i2: "InstanceParam 2"};
        var customParamMap = {c1:"CustomParam 1", c2:"CustomParam 2"};
        var location = modeling.geometry.point([1,2,3]);
        var structuralType = "NonStructural";


        it("should return error if required parameters are not provided.", function () {
            var el = revit.createOneLevelFamilyInstance();
            expect(el.Error).toBeDefined();
            var el = revit.createOneLevelFamilyInstance("Id-1", undefined, "Family", "Type",
                location, "Level-1", structuralType, false, false, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
            el = revit.createOneLevelFamilyInstance("Id-1", "Category", "Family", undefined,
                location, "Level-1", structuralType, true, true, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
            el = revit.createOneLevelFamilyInstance("Id-1", "Category", "Family", "Type", location,
                undefined, structuralType, true, false, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
        });

        it("should work.", function () {
            var el = revit.createOneLevelFamilyInstance("Id-1", "Category-1", "Family-1", "Type-1", location, "Level-1", structuralType, false, false, instanceParamMap, customParamMap);
            expect(forceJSON(el)).toEqual(forceJSON({
                Out: {
                    primitive: "revitElement",
                    fluxId: "Id-1",
                    familyInfo: {
                        category: "Category-1",
                        family: "Family-1",
                        type: "Type-1",
                        placementType: "OneLevelBased"
                    },
                    geometryParameters: {
                        location: modeling.geometry.point(location),
                        level: "Level-1",
                        structuralType: "NonStructural",
                        faceFlipped: false,
                        handFlipped: false
                    },
                    instanceParameters: {
                        i1:"InstanceParam 1",
                        i2:"InstanceParam 2"
                    },
                    typeParameters: {
                    },
                    customParameters: {
                        c1:"CustomParam 1",
                        c2:"CustomParam 2"
                    }
                }
            }));
        });

        it("should work with location as point or array.", function() {
            var locationArray = [1.0, 2.0, 3.0];
            var e1 = revit.createOneLevelFamilyInstance("Id-1", "Category-1", "Family-1", "Type-1",
                location, "Level-1", structuralType, false, false, instanceParamMap, customParamMap);
            expect(e1.Error).toBeUndefined();
            var e2 = revit.createOneLevelFamilyInstance("Id-1", "Category-1", "Family-1", "Type-1",
                locationArray, "Level-1", structuralType, false, false, instanceParamMap, customParamMap);
            expect(e2.error).toBeUndefined();
            expect(forceJSON(e1)).toEqual(forceJSON(e2));
        });
    });

    describe("createTwoLevelFamilyInstance", function() {
        var instanceParamMap = {i1: "InstanceParam 1", i2: "InstanceParam 2"};
        var customParamMap = {c1:"CustomParam 1", c2:"CustomParam 2"};
        var location = modeling.geometry.point([10,20,30]);
        var structuralType = "NonStructural";

        it("should return error if required parameters are not provided.", function () {
            var el = revit.createTwoLevelFamilyInstance();
            expect(el.Error).toBeDefined();
            var el = revit.createTwoLevelFamilyInstance("Id-1", undefined, "Family", "Type",
                location, "Level-1", "Level-2", false, false, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
            el = revit.createTwoLevelFamilyInstance("Id-1", "Category", "Family", undefined,
                location, "Level-1", "Level-2", true, true, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
            el = revit.createTwoLevelFamilyInstance("Id-1", "Category", "Family", "Type", location,
                undefined, "Level-2", true, false, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
            el = revit.createTwoLevelFamilyInstance("Id-1", "Category", "Family", "Type", location,
                "Level-1", undefined, true, false, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
        });

        it("should work.", function () {
            var el = revit.createTwoLevelFamilyInstance("Id-1", "Category-1",
                "Family-1", "Type-1", location, "Level-1", "Level-2", structuralType,
                false, false, instanceParamMap, customParamMap);
            expect(forceJSON(el)).toEqual(forceJSON({
                Out: {
                    primitive: "revitElement",
                    fluxId: "Id-1",
                    familyInfo: {
                        category: "Category-1",
                        family: "Family-1",
                        type: "Type-1",
                        placementType: "TwoLevelsBased"
                    },
                    geometryParameters: {
                        location: modeling.geometry.point(location),
                        baseLevel: "Level-1",
                        topLevel: "Level-2",
                        structuralType: "NonStructural",
                        faceFlipped: false,
                        handFlipped: false
                    },
                    instanceParameters: {
                        i1:"InstanceParam 1",
                        i2:"InstanceParam 2"
                    },
                    typeParameters: {
                    },
                    customParameters: {
                        c1:"CustomParam 1",
                        c2:"CustomParam 2"
                    }
                }
            }));
        });

        it("should work with location as point or array.", function() {
            var locationArray = [10.0, 20.0, 30.0];
            var e1 = revit.createTwoLevelFamilyInstance("Id-1", "Category-1",
                "Family-1", "Type-1", location, "Level-1", "Level-2", structuralType,
                false, false, instanceParamMap, customParamMap);
            expect(e1.Error).toBeUndefined();
            var e2 = revit.createTwoLevelFamilyInstance("Id-1", "Category-1",
                "Family-1", "Type-1", locationArray, "Level-1", "Level-2", structuralType,
                false, false, instanceParamMap, customParamMap);
            expect(e2.error).toBeUndefined();
            expect(forceJSON(e1)).toEqual(forceJSON(e2));
        });
    });

    describe("createOneLevelHostedFamilyInstance", function() {
        var instanceParamMap = {i1: "InstanceParam 1", i2: "InstanceParam 2"};
        var customParamMap = {c1:"CustomParam 1", c2:"CustomParam 2"};
        var location = modeling.geometry.point([10.0, 11.0, 12.0]);
        var structuralType = "NonStructural";


        it("should return error if required parameters are not provided.", function () {
            var el = revit.createOneLevelHostedFamilyInstance();
            expect(el.Error).toBeDefined();
            var el = revit.createOneLevelHostedFamilyInstance("Id-1", undefined, "Family", "Type",
                location, "HostId-1", "Level-1", false, false, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
            el = revit.createOneLevelHostedFamilyInstance("Id-1", "Category", "Family", undefined,
                location, "HostId-1", "Level-1", true, true, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
            el = revit.createOneLevelHostedFamilyInstance("Id-1", "Category", "Family", "Type",
                location, undefined, "Level-1", true, true, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
            el = revit.createOneLevelHostedFamilyInstance("Id-1", "Category", "Family", "Type", location,
                "HostId-1", undefined, true, false, instanceParamMap, customParamMap);
            expect(el.Error).toBeDefined();
        });

        it("should work.", function () {
            var el = revit.createOneLevelHostedFamilyInstance("Id-1", "Category-1", "Family-1",
                "Type-1", location, "HostId-1", "Level-1", structuralType, false, false, instanceParamMap, customParamMap);
            expect(forceJSON(el)).toEqual(forceJSON({
                Out: {
                    primitive: "revitElement",
                    fluxId: "Id-1",
                    familyInfo: {
                        category: "Category-1",
                        family: "Family-1",
                        type: "Type-1",
                        placementType: "OneLevelBasedHosted"
                    },
                    geometryParameters: {
                        location: modeling.geometry.point(location),
                        hostId: "HostId-1",
                        level: "Level-1",
                        structuralType: "NonStructural",
                        faceFlipped: false,
                        handFlipped: false
                    },
                    instanceParameters: {
                        i1:"InstanceParam 1",
                        i2:"InstanceParam 2"
                    },
                    typeParameters: {
                    },
                    customParameters: {
                        c1:"CustomParam 1",
                        c2:"CustomParam 2"
                    }
                }
            }));
        });

        it("should work with location as point or array.", function() {
            var locationArray = [10.0, 11.0, 12.0];
            var e1 = revit.createOneLevelHostedFamilyInstance("Id-1", "Category-1", "Family-1",
                "Type-1", location, "HostId-1", "Level-1", structuralType, false, false, instanceParamMap, customParamMap);
            expect(e1.Error).toBeUndefined();
            var e2 = revit.createOneLevelHostedFamilyInstance("Id-1", "Category-1", "Family-1",
                "Type-1", locationArray, "HostId-1", "Level-1", structuralType, false, false, instanceParamMap, customParamMap);
            expect(e2.error).toBeUndefined();
            expect(forceJSON(e1)).toEqual(forceJSON(e2));
        });
    });

    describe("createDirectShapeElement", function() {
        var customParamMap = {c1:"CustomParam 1", c2:"CustomParam 2"};
        var geomMesh = [{primitive: "mesh"}];
        it("should return error if required parameters are not provided.", function() {
            var el = revit.createDirectShapeElement();
            expect(el.Error).toBeDefined();
            el = revit.createDirectShapeElement("Id-1", undefined, geomMesh, customParamMap);
            expect(el.Error).toBeDefined();
            el = revit.createDirectShapeElement("Id-1", "Walls", undefined, customParamMap);
            expect(el.Error).toBeDefined();
        });

        it("should work", function() {
            var el = revit.createDirectShapeElement("Id-1", "Walls", geomMesh, customParamMap);
            expect(forceJSON(el)).toEqual(forceJSON({
                Out: {
                    primitive: "revitElement",
                    fluxId: "Id-1",
                    familyInfo: {
                        category: "Walls",
                        family: "DirectShape",
                        type: "",
                        placementType: "Invalid"
                    },
                    geometryParameters: {
                        geometry: geomMesh
                    },
                    instanceParameters: {
                    },
                    typeParameters: {
                    },
                    customParameters: {
                        c1:"CustomParam 1",
                        c2:"CustomParam 2"
                    }
                }
            }));
        });
    });

    describe("selectParameter", function() {
        var el;
        beforeEach(function() {
            var info = {
                category: "foo",
                family: "bar",
                type: "zob",
                placementType: "Invalid"
            };
            el = revit.createElement("Id-1", info, {g1: 1, g2:null}, {cg1: 2, i2:null},
                {t1: 1, t2:null}, {cg1: 3, c2:null}).Out;
        });

        it("should work for bare parameters.", function() {
            expect(revit.selectParameter(el, "g1")).toEqual({Out:1, Found:true});
            expect(revit.selectParameter(el, "g2")).toEqual({Out:null, Found:true});
            expect(revit.selectParameter(el, "t3").Found).toBeFalsy();
        });

        it("should work for familyInfo properties.", function() {
            expect(revit.selectParameter(el, "category")).toEqual({Out: "foo", Found: true});
        });

        it("should find first occurance.", function() {
            expect(revit.selectParameter(el, "cg1")).toEqual({Out:2, Found:true});
        });

        it("should find correct occurance with full pat.", function() {
            expect(revit.selectParameter(el, "customParameters/cg1")).toEqual({Out:3, Found:true});
        });

        it("should work for raw paths.", function() {
            expect(revit.selectParameter(el, "familyInfo/category")).toEqual({Out:"foo", Found:true});
        });

        it("should not give error with bad input", function() {
            expect(revit.selectParameter({}, "c1")).toEqual({Out: undefined, Found:false});
        });
    });

    describe("updateParameters", function() {
        var el;

        beforeEach(function() {
            var info = {
                category: "foo",
                family: "bar",
                type: "zob",
                placementType: "Invalid"
            };
            el = revit.createElement("Id-1",info, {g1:1, g2:2}, {i1:3, i2:4},
                {t1:5, t2:6}, {c1:7, c2:8}).Out;
        });

        it("should be idempotent for non-elements", function() {
            var fakeElement = {g1:3};
            var out = revit.updateParameters(fakeElement, {g1:10});
            expect(out.Out).toEqual(fakeElement);
            expect(out.Error).toBeDefined();
        });

        it("should be idempotent for bad parameterMaps", function() {
            var out = revit.updateParameters(el, "a");
            expect(out.Out).toEqual(el);
            expect(out.Error).toBeDefined();
        });

        it("should work", function() {
            var expected = forceJSON(el);
            expected.geometryParameters.g1 = 2;
            expected.typeParameters.t2 = "a";
            expect(revit.updateParameters(el, {g1:2, t2:"a"}).Out).toEqual(expected);
        });
    });
});
