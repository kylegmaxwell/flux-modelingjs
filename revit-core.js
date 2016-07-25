'use strict';

var jsonpointer = require('json-pointer');
var modeling = require('./index').modeling({genId: null});

/**
* Function to create a revit element.
*
* @param {string} [fluxId] Flux Id of the element.
* @param {object} [familyInfo] Flux Id of the element.
* @param {object} [geomParamMap] Geometry Parameters of the element.
* @param {object} [instanceParamMap] Instance parameters of the element.
* @param {object} [typeParamMap] Type parameters of the element.
* @param {object} [customParamMap] Custom parameters of the element.
* @returns {{Out: revit/Element}} The created revit model line.
*/
function createElement(fluxId, familyInfo, geomParamMap, instanceParamMap, typeParamMap, customParamMap) {
    if (fluxId === undefined) {
        fluxId = null;
    }

    var check = checkFluxId(fluxId);
    if (!check.valid) {
        return {Error: "Element could not be created: " + check.msg};
    }

    if (!isInvalid(fluxId)) {
        fluxId = String(fluxId);
    }

    check = checkFamilyInfo(familyInfo);
    if (!check.valid) {
        return {Error: "Element could not be created: " + check.msg};
    }
    check = checkParameterMap(geomParamMap);
    if (!check.valid) {
        return {Error: "Element could not be created: " + check.msg};
    }
    check = checkParameterMap(instanceParamMap);
    if (!check.valid) {
        instanceParamMap = {};
    }
    check = checkParameterMap(typeParamMap);
    if (!check.valid) {
        typeParamMap = {};
    }
    check = checkParameterMap(customParamMap);
    if (!check.valid) {
        customParamMap = {};
    }

    return {
        Out: {
            primitive: "revitElement",
            fluxId: fluxId,
            familyInfo: familyInfo,
            geometryParameters: geomParamMap,
            instanceParameters: instanceParamMap,
            typeParameters: typeParamMap,
            customParameters: customParamMap
        }
    };
}

/**
* Function to create a revit Model Line.
*
* @param {object} [modelCurve] Input curve.
* @returns {{Out: revit-modelLine}} The created revit model line.
*/
function createModelLine(fluxId, modelCurve) {
    var familyInfo = {
        category: "Lines",
        family: "ModelCurve",
        type: "",
        placementType: "Invalid"
    };
    var geomParams = {
        curve: modelCurve
    };

    var missingParams = checkForKeys(familyInfo, ["category", "family"]);
    if (missingParams) {
        return {Error: "Model Line element could not be created: Missing required familyinfo parameters " + missingParams.join(", ")};
    }
    missingParams = checkForKeys(geomParams, ["curve"]);
    if (missingParams) {
        return {Error: "Model Line element could not be created: Missing required geometry parameters " + missingParams.join(", ")};
    }

    var modelLine = createElement(fluxId, familyInfo, geomParams, undefined, undefined, undefined);
    if (modelLine.Error) {
        return {Error: "Model Line " + modelLine.Error};
    }

    return modelLine;
}

/**
* Function to create a revit reference plane.
*
* @param {position} [bubbleEnd] First point on reference plane.
* @param {position} [freeEnd] Second point on reference plane.
* @param {vector} [cutVector] Vector perpendicular to vector from bubbleEnd to freeEnd, tangent to the reference plane.
* @param {string} [name] Name of the reference plane.
* @param {boolean} [wallClosure] If reference plane is wall closure.
* @returns {{Out: revit-referencePlane}} The created revit reference plane.
*/
function createReferencePlane(fluxId, bubbleEnd, freeEnd, cutVector, name, wallClosure) {
    var familyInfo = {
        category: "Reference Planes",
        family: "ReferencePlane",
        type: "",
        placementType: "Invalid"
    };

    var validBubbleEnd = createPoint(bubbleEnd);
    if (validBubbleEnd.Error) {
        return validBubbleEnd;
    }

    var validFreeEnd = createPoint(freeEnd);
    if (validFreeEnd.Error) {
        return validFreeEnd;
    }

    var validCutVector = createVector(cutVector);
    if (validCutVector.Error) {
        return validCutVector;
    }

    var geomParams = {
        bubbleEnd: validBubbleEnd,
        freeEnd: validFreeEnd,
        cutVector: validCutVector,
        name: isInvalid(name) ? null : name,
        wallClosure: !!wallClosure
    };
    var missingParams = checkForKeys(familyInfo, ["category", "family"]);
    if (missingParams) {
        return {Error: "Reference Plane element could not be created: Missing required familyinfo parameters " + missingParams.join(", ")};
    }
    missingParams = checkForKeys(geomParams, ["bubbleEnd", "freeEnd", "cutVector"]);
    if (missingParams) {
        return {Error: "Reference Plane element could not be created: Missing required geometry parameters " + missingParams.join(", ")};
    }
    var refPlane = createElement(fluxId, familyInfo, geomParams, undefined, undefined, undefined);
    if (refPlane.Error) {
        return {Error: "Reference Plane " + refPlane.Error};
    }
    return refPlane;
}

/**
* Function to create a revit level.
*
* @param {string} [fluxId] Flux Id for the level.
* @param {string} [levelType] Type of the level.
* @param {number} [elevation] Elevation of the level.
* @param {string} [name] Name of the level.
* @param {object} [instanceParams] Instance parameters to be assigned to this element.
* @param {object} [customParams] Custom parameters to be assigned to this element.
* @returns {{Out: revit-level}} The created revit level.
*/
function createLevel(fluxId, levelType, elevation, name, instanceParams, customParams) {
    var familyInfo = {
        category: "Levels",
        family: "Level",
        type: levelType,
        placementType: "Invalid"
    };
    var geomParams = {
        name: name,
        elevation: elevation
    };
    var missingParams = checkForKeys(familyInfo, ["type"]);
    if (missingParams) {
        return {Error: "Level element could not be created: Missing required familyinfo parameters " + missingParams.join(", ")};
    }
    missingParams = checkForKeys(geomParams, ["name", "elevation"]);
    if (missingParams) {
        return {Error: "Level element could not be created: Missing required geometry parameters " + missingParams.join(", ")};
    }
    var level = createElement(fluxId, familyInfo, geomParams, instanceParams, undefined, customParams);
    if (level.Error) {
        return {Error: "Level " + level.Error};
    }
    return level;
}

/**
* Function to create a revit grid.
*
* @param {string} [fluxId] Flux Id for the level.
* @param {string} [gridType] Type of the grid.
* @param {object} [gridCurve] Grid line.
* @param {string} [gridName] Name of the grid.
* @param {object} [instanceParams] Instance parameters to be assigned to this element.
* @param {object} [customParams] Custom parameters to be assigned to this element.
* @returns {{Out: revit-level}} The created revit grid.
*/
function createGrid(fluxId, gridType, gridCurve, gridName, instanceParams, customParams) {
    var familyInfo = {
        category: "Grids",
        family: "Grid",
        type: gridType,
        placementType: "Invalid"
    }
    var geomParams = {
        name: gridName,
        curve: gridCurve
    }
    var missingParams = checkForKeys(familyInfo, ["type"]);
    if (missingParams) {
        return {Error: "Grid element could not be created: Missing required familyinfo parameters " + missingParams.join(", ")};
    }

    missingParams = checkForKeys(geomParams, ["name", "curve"]);
    if (missingParams) {
        return {Error: "Grid element could not be created: Missing required geometry parameters " + missingParams.join(", ")};
    }
    var grid = createElement(fluxId, familyInfo, geomParams, instanceParams, undefined, customParams);
    if (grid.Error) {
        return {Error: "Grid " + grid.Error};
    }
    return grid;
}

/**
* Function to create a revit room.
*
* @param {string} [fluxId] Flux Id for the level.
* @param {position} [location] Location of the room.
* @param {string} [level] Level of the room.
* @param {string} [name] Name of the room.
* @param {object} [instanceParams] Instance parameters to be assigned to this element.
* @param {object} [customParams] Custom parameters to be assigned to this element.
* @returns {{Out: revit-room}} The created revit room.
*/
function createRoom(fluxId, location, level, name, instParamMap, custParamMap) {
    var familyInfo = {
        category: "Rooms",
        family: "Room",
        type: "",
        placementType: "Invalid"
    };

    var validUV = createPoint(location);
    if (validUV.Error) {
        return validUV;
    }

    var geomParams = {
        uv: validUV,
        level: extractLevelName(level),
        name: name
    };
    var missingParams = checkForKeys(familyInfo, ["category", "family"]);
    if (missingParams) {
        return {Error: "Room element could not be created: Missing required familyinfo parameters " + missingParams.join(", ")};
    }
    missingParams = checkForKeys(geomParams, ["uv", "name", "level"]);
    if (missingParams) {
        return {Error: "Room element could not be created: Missing required geometry parameters " + missingParams.join(", ")};
    }
    var room = createElement(fluxId, familyInfo, geomParams, instParamMap, undefined, custParamMap);
    if (room.Error) {
        return {Error: "Room " + room.Error};
    }
    return room;
}

/**
* Function to create a revit wall.
*
* @param {string} [fluxId] Flux Id for the wall.
* @param {string} [family] Family of the wall.
* @param {string} [type] Type of the wall.
* @param {object} [profile] Wall profile.
* @param {string|object} [level] Base level of the wall.
* @param {boolean} [structural] True of wall is structural, false otherwise.
* @param {boolean} [flipped] True of wall is flipped, false otherwise.
* @param {object} [instanceParams] Instance parameters to be assigned to this element.
* @param {object} [customParams] Custom parameters to be assigned to this element.
* @returns {{Out: revit-wall}} The created revit wall.
*/
function createWall(fluxId, family, type, profile, level, structural, flipped, instParamMap, custParamMap) {
    var familyInfo = {
        category: "Walls",
        family: family,
        type: type,
        placementType: "Invalid"
    };
    var geomParams = {
        profile: profile,
        level: extractLevelName(level),
        structural: !!structural,
        flipped: !!flipped
    };

    var missingParams = checkForKeys(familyInfo, ["family", "type"]);
    if (missingParams) {
        return {Error: "Level element could not be created: Missing required familyinfo parameters " + missingParams.join(", ")};
    }

    missingParams = checkForKeys(geomParams, ["profile", "level", "structural", "flipped"]);
    if (missingParams) {
        return {Error: "Wall element could not be created: Missing required parameters " + missingParams.join(", ")};
    }

    var wall = createElement(fluxId, familyInfo, geomParams, instParamMap, undefined, custParamMap);
    if (wall.Error) {
        return {Error: "Wall " + wall.Error};
    }
    return wall;
}

/**
* Function to create a revit floor.
*
* @param {string} [fluxId] Flux Id for the floor.
* @param {string} [type] Type of the floor.
* @param {object} [profile] Floor profile.
* @param {string|object} [level] Level of the floor.
* @param {boolean} [structural] True of floor is structural, false otherwise.
* @param {object} [instanceParams] Instance parameters to be assigned to this element.
* @param {object} [customParams] Custom parameters to be assigned to this element.
* @returns {{Out: revit-floor}} The created revit floor.
*/
function createFloor(fluxId, type, profile, level, structural, instanceParams, customParams) {
    var familyInfo = {
        category: "Floors",
        family: "Floor",
        type: type,
        placementType: "Invalid"
    };
    var geomParams = {
        profile: profile,
        level: extractLevelName(level),
        structural: !!structural
    };

    var missingParams = checkForKeys(familyInfo, ["category", "family", "type"]);
    if (missingParams) {
        return {Error: "Level element could not be created: Missing required familyinfo parameters " + missingParams.join(", ")};
    }

    missingParams = checkForKeys(geomParams, ["profile", "level", "structural"]);
    if (missingParams) {
        return {Error: "Floor element could not be created: Missing required parameters " + missingParams.join(", ")};
    }

    var floor = createElement(fluxId, familyInfo, geomParams, instanceParams, undefined, customParams);
    if (floor.Error) {
        return {Error: "Floor " + floor.Error};
    }
    return floor;
}

/**
* Function to create a revit family instance.
*
* @param {string} [fluxId] Flux Id for the family instance.
* @param {string} [category] Category of the family instance.
* @param {string} [family] Family of of the family instance.
* @param {string} [type] Type of the family insance.
* @param {object} [location] Location of the family instance.
* @param {string|object} [level] Level of the family instance.
* @param {string} [structuralType] Structural Type of the family insance.
* @param {boolean} [faceFlipped] True if the family instance if face flipped. false otherwise.
* @param {boolean} [handFlipped] True if the family instance if hand flipped, false otherwise.
* @param {object} [instanceParams] Instance parameters to be assigned to this element.
* @param {object} [customParams] Custom parameters to be assigned to this element.
* @returns {{Out: revit-oneLevelFamilyInstance}} The created revit family instance.
*/
function createOneLevelFamilyInstance(fluxId, category, family, type, location,
        level,  structuraltype, faceflipped, handflipped, instanceParams, customParams) {
    var familyInfo = {
        category: category,
        family: family,
        type: type,
        placementType: "OneLevelBased"
    };
    var geomParams = {
        location: getLocation(location),
        level: extractLevelName(level),
        structuralType: getValidStructuralType(structuraltype),
        faceFlipped: !!faceflipped,
        handFlipped: !!handflipped
    };

    var missingParams = checkForKeys(familyInfo, ["category", "family", "type"]);
    if (missingParams) {
        return {Error: "Family Instance could not be created: Missing required familyinfo parameters " + missingParams.join(", ")};
    }

    missingParams = checkForKeys(geomParams, ["location", "level", "structuralType", "faceFlipped", "handFlipped"]);
    if (missingParams) {
        return {Error: "Family Instance could not be created: Missing required parameters " + missingParams.join(", ")};
    }

    var familyInstance = createElement(fluxId, familyInfo, geomParams, instanceParams, undefined, customParams);
    if (familyInstance.Error) {
        return {Error: "FamilyInstance " + familyInstance.Error};
    }

    return familyInstance;
}

/**
* Function to create a revit family instance.
*
* @param {string} [fluxId] Flux Id for the family instance.
* @param {string} [category] Category of the family instance.
* @param {string} [family] Family of of the family instance.
* @param {string} [type] Type of the family insance.
* @param {object} [location] Location of the family instance.
* @param {string|revit-level} [baseLevel] Base level of the family instance.
* @param {string|revit-level} [topLevel] Top level of the family instance.
* @param {string} [structuralType] Structural Type of the family insance.
* @param {boolean} [faceFlipped] True if the family instance if face flipped. false otherwise.
* @param {boolean} [handFlipped] True if the family instance if hand flipped, false otherwise.
* @param {object} [instanceParams] Instance parameters to be assigned to this element.
* @param {object} [customParams] Custom parameters to be assigned to this element.
* @returns {{Out: revit-twoLevelFamilyInstance}} The created revit family instance.
*/
function createTwoLevelFamilyInstance(fluxId, category, family, type, location,
        baselevel, toplevel, structuraltype, faceflipped, handflipped, instanceParams, customParams) {
    var familyInfo = {
        category: category,
        family: family,
        type: type,
        placementType: "TwoLevelsBased"
    };
    var geomParams = {
        location: getLocation(location),
        baseLevel: extractLevelName(baselevel),
        topLevel: extractLevelName(toplevel),
        structuralType: getValidStructuralType(structuraltype),
        faceFlipped: !!faceflipped,
        handFlipped: !!handflipped
    };

    var missingParams = checkForKeys(familyInfo, ["category", "family", "type"]);
    if (missingParams) {
        return {Error: "Family Instance could not be created: Missing required familyinfo parameters " + missingParams.join(", ")};
    }

    missingParams = checkForKeys(geomParams, ["location", "baseLevel", "topLevel", "structuralType", "faceFlipped", "handFlipped"]);
    if (missingParams) {
        return {Error: "Family Instance could not be created: Missing required parameters " + missingParams.join(", ")};
    }

    var familyInstance = createElement(fluxId, familyInfo, geomParams, instanceParams, undefined, customParams);
    if (familyInstance.Error) {
        return {Error: "FamilyInstance " + familyInstance.Error};
    }

    return familyInstance;
}

/**
* Function to create a revit family instance.
*
* @param {string} [fluxId] Flux Id for the family instance.
* @param {string} [category] Category of the family instance.
* @param {string} [family] Family of of the family instance.
* @param {string} [type] Type of the family insance.
* @param {object} [location] Location of the family instance.
* @param {string|revit-level} [level] Level of the family instance.
* @param {string|object} [host] Host element of the family insance.
* @param {string} [structuralType] Structural Type of the family insance.
* @param {boolean} [faceFlipped] True if the family instance if face flipped. false otherwise.
* @param {boolean} [handFlipped] True if the family instance if hand flipped, false otherwise.
* @param {object} [instanceParams] Instance parameters to be assigned to this element.
* @param {object} [customParams] Custom parameters to be assigned to this element.
* @returns {{Out: revit-twoLevelFamilyInstance}} The created revit family instance.
*/
function createOneLevelHostedFamilyInstance(fluxId, category, family, type, location,
        host, level,  structuraltype, faceflipped, handflipped, instanceParams, customParams) {
    var familyInfo = {
        category: category,
        family: family,
        type: type,
        placementType: "OneLevelBasedHosted"
    };
    var geomParams = {
        location: getLocation(location),
        hostId: extractFluxId(host),
        level: extractLevelName(level),
        structuralType: getValidStructuralType(structuraltype),
        faceFlipped: !!faceflipped,
        handFlipped: !!handflipped
    };

    var missingParams = checkForKeys(familyInfo, ["category", "family", "type"]);
    if (missingParams) {
        return {Error: "Family Instance could not be created: Missing required familyinfo parameters " + missingParams.join(", ")};
    }

    missingParams = checkForKeys(geomParams, ["location", "hostId", "level", "structuralType", "faceFlipped", "handFlipped"]);
    if (missingParams) {
        return {Error: "Family Instance could not be created: Missing required parameters " + missingParams.join(", ")};
    }

    var familyInstance = createElement(fluxId, familyInfo, geomParams, instanceParams, undefined, customParams);
    if (familyInstance.Error) {
        return {Error: "FamilyInstance " + familyInstance.Error};
    }

    return familyInstance;
}

 /**
* Function to get a valid Structural type. Valid structural types are Beam, Column,
* Brace, Footing and NonStructural. If invalid structural type is provided, NonStructural
* woudl be returned.
*
* @param {string} [structuralType] Structural type of a revit family instance.
* @returns {string} Beam | Column | Brace | Footing | NonStructural.
*/
function getValidStructuralType(structuralType) {
    var defaultStructualType = "NonStructural";

    if (isInvalid(structuralType)) {
        return defaultStructualType;
    }

    if (typeof structuralType !== "string") {
        return defaultStructualType;
    }

    if (structuralType === defaultStructualType)
        return defaultStructualType;

    if (structuralType.toLowerCase() === "beam")
        return "Beam";

    if (structuralType.toLowerCase() === "column")
        return "Column";

    if (structuralType.toLowerCase() === "brace")
        return "Brace";

    if (structuralType.toLowerCase() === "footing")
        return "Footing";

    console.warn("Invalid StructrualType: %s provided. Defaulting to %s", structuralType, defaultStructualType);

    return defaultStructualType;
}

/**
* Function to extract FluxId of a revit element.
*
* @param {object} [element] Valid revit element.
* @returns {string} Flux Id of the element.
*/
function extractFluxId(element) {
    if (typeof element === "string") {
        return element;
    }
    var fluxId = get(element, "fluxId");
    if (fluxId.Found) {
        return fluxId.Out;
    }
}

/**
* Function to extract name of a revit level.
*
* @param {object} [element] Valid revit level.
* @returns {string} Name of the level element.
*/
function extractLevelName(elementOrLevel) {

    if (typeof elementOrLevel === "string") {
        return elementOrLevel;
    }
    var name = selectParameter(elementOrLevel, "name");
    if (name.Found) {
        return name.Out;
    }
}

/**
* Function to get the value of an element's parameter.
* Parameter would be searched in following oreder within the revit
* schema: familyInfo, geometryParameters, instanceParameters,
* typeParameters, customParameters. If no match is found
* full path of the parameter is used.
*
* @param {object} [element] Valid revit level.
* @param {string} [parameter] Name of the parameter.
* @returns {Out: object} Value of parameer if found.
*/
function selectParameter(element, parameter) {
    // Then check in familyInfo.
    var value = get(element, "familyInfo/" + parameter);
    if (value.Found) {
        return value;
    }

    // First check Geometry Parameters
    value = get(element, "geometryParameters/" + parameter);
    if (value.Found) {
        return value;
    }

    // Next Instance Parameters
    value = get(element, "instanceParameters/" + parameter);
    if (value.Found) {
        return value;
    }

    // Next Type Parameters
    value = get(element, "typeParameters/" + parameter);
    if (value.Found) {
        return value;
    }

    // Next Custom Parameters
    value = get(element, "customParameters/" + parameter);
    if (value.Found) {
        return value;
    }

    // Otherwise, last ditch, just defer to Get.
    return get(element, parameter);
}

/**
* Function to update the value of an element's parameter.
* Parameter would be searched in following oreder within the revit
* schema: familyInfo, geometryParameters, instanceParameters,
* typeParameters, customParameters. If no match is found
* full path of the parameter is used.
*
* @param {object} [element] Valid revit level.
* @param {object} [newParameterMap] Key-value pair of parameters.
* @returns {Out: object} Updated element.
*/
function updateParameters(element, newParameterMap) {
    var check = checkElement(element);
    if (!check.valid) {
        return {
            Error: "Element was not updated: " + check.msg,
            Out: element
        };
    }

    check = checkParameterMap(newParameterMap);
    if (!check.valid) {
        return {
            Error: "Element was not updated: " + check.msg,
            Out: element
        };
    }

    // Try and check in each section of the schema if the
    // parameter exists. If it does update it.
    // If the parameter does not exits and full path to the parameter
    // to the known section of the schema is provided, add a
    // new parameter to that section. Otherwise add the new parameter
    // as a custom parameter.
    for(var param in newParameterMap) {
        // Check if we are provided a full path for the parameter
        var val = newParameterMap[param];
        var value = get(element, param);
        if (value.Found) {
            set(element, param, val);
            continue;
        }

        // check FamilyInfo
        value = get(element, "familyInfo/" + param);
        if (value.Found) {
            set(element, "familyInfo/" + param, val);
            continue;
        }

        // Check if we should update a Geometry Parameter
        var value = get(element, "geometryParameters/" + param);
        if (value.Found){
            set(element, "geometryParameters/" + param, val);
            continue;
        }

        // Check if we should udpate an Instance Parameter
        value = get(element, "instanceParameters/" + param);
        if (value.Found) {
            set(element, "instanceParameters/" + param, val);
            continue;
        }

        // Check if we should update a Type Parameter
        value = get(element, "typeParameters/" + param);
        if (value.Found) {
            set(element, "typeParameters/" + param, val);
            continue;
        }

        // We do not add a new parameter to the familyInfo. That section
        // of the schema is not user modifiable  and any unknown parameter
        // in familyInfo is ignored by he plugin.
        if (param.indexOf("familyInfo/") === 0) {
            continue;
        }

        // Check if we should add a geometry, instance or type parameter
        if (param.indexOf("geometryParameters/") === 0 ||
            param.indexOf("instanceParameters/") === 0 ||
            param.indexOf("typeParameters/") === 0) {
            set(element, param, val);
            continue;
        }

        // Add Or Update a Custom Parameter
        set(element, "customParameters/" + param, val);
    }

    return {Out: element};
}

// TODO validate against schema.
/**
* Function to check if a given element is a revit element.
*
* @param {object} [element] Any object.
* @returns {valid: boolean} True of valid revit element, false otherwise.
*/
function checkElement(element) {
    if (!isRevitElement(element)) {
        return {valid: false, msg: "Element is not a revit/Element"};
    }

    var check = checkFamilyInfo(element.familyInfo);
    if (!check.valid) {
        return {valid: false, msg: "Element has an invalid familyInfo: " + check.msg};
    }
    check = checkParameterMap(element.geometryParameters);
    if (!check.valid) {
        return {valid: false, msg: "Element has an invalid geometry parameters map: " + check.msg};
    }
    check = checkParameterMap(element.instanceParameters);
    if (!check.valid) {
        return {valid: false, msg: "Element has an invalid instance parameters map: " + check.msg};
    }
    check = checkParameterMap(element.typeParameters);
    if (!check.valid) {
        return {valid: false, msg: "Element has an invalid type parameters map: " + check.msg};
    }

    check = checkParameterMap(element.customParameters);
    if (!check.valid) {
        return {valid: false, msg: "Element has an invalid custom parameters map: " + check.msg};
    }
    return {valid: true};
}

/**
* Function to check if a primitive==revitElement.
*
* @param {object} [element] Any object.
* @returns {valid: boolean} True if promitive==revitelement, false otherwise.
*/
function isRevitElement(element) {
    var primitive = get(element, "primitive");
    return primitive.Found && primitive.Out === "revitElement";
}

// TODO check against schema.
function checkParameterMap(parameterMap) {
    if (isInvalid(parameterMap)) {
        return {valid: false, msg: "No parameter map provided."};
    }
    if (typeof parameterMap !== "object") {
        return {valid: false, msg: "Parameter map is not a map."};
    }
    return {valid: true};
}

// TODO check against schema.
function checkFamilyInfo(info) {
    // check familyInfo is well-formed.
    if (isInvalid(info)) {
        return {valid: false, msg: "No familyInfo field provided."};
    }
    if (typeof info !== "object") {
        return {valid: false, msg: "FamilyInfo is not a map."};
    }
    var missingFields = checkForKeys(info, ["category", "family", "type", "placementType"]);
    if (missingFields) {
        var msg = "Missing " + missingFields.join(", ") + " fields in familyInfo";
        return {valid: false, msg: msg};
    }

    var check = checkValidPlacementType(info);
    if (!check.valid) {
        var message = "Invalid placementType " + info.PlacementType;
        return {valid: false, msg: message};
    }

    return {valid: true};
}

// TODO check against schema.
function checkFluxId(fluxId) {
    if (fluxId === null) {
        return {valid: true};
    }

    if (typeof fluxId !== "string" && typeof fluxId != "number") {
        return {valid: false, msg:"FluxId is not valid."};
    }

    if (fluxId.length === 0 || /^\s*$/.test(fluxId)) {
        return {valid: false, msg:"FluxId is not valid."};
    }

    return {valid: true};
}

// TODO check against schema
function checkValidPlacementType(info) {
    if (info.placementType === "OneLevelBased" ||
        info.placementType === "TwoLevelsBased" ||
        info.placementType === "OneLevelBasedHosted" ||
        info.placementType === "Invalid") {
        return {valid: true};
    }

    return {valid: false};
}

function checkForKeys(obj, keys) {
    var missingKeys = keys.filter(function(key) {
        return !obj.hasOwnProperty(key) || isInvalid(obj[key]);
    });
    if (missingKeys.length > 0) {
        return missingKeys;
    }
}

/**
 * @param {Object} x
 *
 * @return {Boolean} True if the input x is null or undefined, and false
 *   otherwise.
 *
 * Note: The reason this is called isInvalid instead of IsValid is
 * because it is meant to mirror IsNull.
 *
 * TODO(daishi): Confirm what value we want to test against. For now
 * check for both null and undefined.
 * (I think we need to resolve the invalid/null question first.)
 */
function isInvalid(x) {
    return x === null || x === undefined;
}

// Roughly maps to the corresponding JSON pointer functions.
// The functions are defined to be robust to invalid paths.
// For get, an invalid path returns undefined for the main output,
// but sets the Found output to false.
// For Set, there are no invalid paths since all necessary intermediate
// objects are created to support the Set.
// For Remove, invalid path exceptions are ignored since that implies
// that there was nothing to remove at the given path.
function get(x, path) {
    path = addRootSlashIfNecessary(path);
    var value;
    var found = true;
    try {
        value = jsonpointer.get(x, path);
    } catch (e) {
        found = false;
    }
    return {
        Out: value,
        Found: found,
    };
}

function set(x, path, value) {
    path = addRootSlashIfNecessary(path);
    jsonpointer.set(x, path, value);
    return x;
}

function addRootSlashIfNecessary(path) {
    if (path.length === 0) {
        throw new Error("Invalid empty path");
    }
    if (path[0] === "/") {
        return path;
    }
    return "/" + path;
}

// A valid location for a family instance in revit could
// be one of: point, curve, line or arc.
// This function returns back a valid location by converting
// an array of numbers to point.
function getLocation(obj) {
    if (isInvalid(obj)) {
        return obj;
    }

    if (obj.primitive == "point" || obj.primitivve == "line" ||
        obj.primitive == "curve" || obj.primitive == "arc") {
        return obj;
    }

    return createPoint(obj);
}

// Returns a point given an array of number or spoint.
// Returns FluxModelingError if the input is invalid.
function createPoint(obj) {
    var pt;
    try {
        pt = modeling.entities.point(obj);
    }
    catch(err) {
        if (err.name !== "FluxModelingError") {
            throw err;
        }
        else {
            return {Error: err.message};
        }
    }

    return pt;
}

function createVector(obj) {
    var vec;
    try {
        vec = modeling.entities.vector(obj);
    }
    catch(err) {
        if (err.name !== "FluxModelingError") {
            throw err;
        }
        else {
            return {Error: err.message};
        }
    }

    return vec;
}

module.exports = {
    createElement: createElement,
    selectParameter: selectParameter,
    updateParameters: updateParameters,
    createModelLine: createModelLine,
    createReferencePlane: createReferencePlane,
    createRoom: createRoom,
    createLevel: createLevel,
    createGrid: createGrid,
    createFloor: createFloor,
    createWall: createWall,
    createOneLevelFamilyInstance: createOneLevelFamilyInstance,
    createTwoLevelFamilyInstance: createTwoLevelFamilyInstance,
    createOneLevelHostedFamilyInstance: createOneLevelHostedFamilyInstance
}
