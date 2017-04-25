var fluxBCF = {

    "$schema": "http://json-schema.org/draft-04/schema#",

    "definitions": {
        "topicType": { "enum": [ "issue", "request", "comment", "solution" ] },
        "topicStatus": { "enum": [ "open", "in progress", "resolved", "closed" ] },
        "bimSnippet": {
            "type": "object",
            "properties": {
                // The filename(s) of the file(s) that contain the BIM object(s)
                "reference": { "type": [ "array", "null" ], "items": { "type": [ "string", "null" ] } },
            },
            "required": [ "reference" ]
        }
    },

    "viewDefinitions": {
        "xyzTuple": {
            "type": "object",
            "properties": {
                "x": { "type": "number" },
                "y": { "type": "number" },
                "z": { "type": "number" },
            },
            "required":  [ "x", "y", "z" ]
        },

        "point": { "$ref": "#/viewDefinitions/xyzTuple" },
        "direction": { "$ref": "#/viewDefinitions/xyzTuple" },
        "location": { "$ref": "#/viewDefinitions/xyzTuple" },
        "clippingPlane": {
            "type": "object",
            "properties": {
                "location": { "$ref": "#/viewDefinitions/location" },
                "direction": { "$ref": "#/viewDefinitions/direction" }
            },
        },
        "line": {
            "type": "object",
            "properties": {
                "startPoint": { "$ref": "#/viewDefinitions/point" },
                "endPoint": { "$ref": "#/viewDefinitions/point" }
            }
        },

        "orthogonalCamera": {
            "type": "object",
            "properties": {
                "cameraViewPoint": { "$ref": "#/viewDefinitions/point" },
                "cameraDirection": { "$ref": "#/viewDefinitions/direction" },
                "cameraUpVector": { "$ref": "#/viewDefinitions/direction" },
                "viewToWorldScale": { "type": "number" }
            },
            "required": [ "cameraViewPoint", "cameraDirection", "cameraUpVector", "viewToWorldScale" ]
        },
        "perspectiveCamera": {
            "type": "object",
            "properties": {
                "cameraViewPoint": { "$ref": "#/viewDefinitions/point" },
                "cameraDirection": { "$ref": "#/viewDefinitions/direction" },
                "cameraUpVector": { "$ref": "#/viewDefinitions/direction" },

                // Camera frustrum: vertical field of view
                "fieldOfView": { "type": "number" }
                // Also consider adding "aspectRatio", "nearPlane", "farPlane"
            },
            "required": [ "cameraViewPoint", "cameraDirection", "cameraUpVector", "fieldOfView" ]
        },

        "imageType": { "type": "string", "enum": [ "jpg", "png" ] },
        "bitmap": {
            "type": "object",
            "properties": {
                "guid": { "type": "string" },
                "bitmapType": { "$ref": "#/viewDefinitions/imageType" },
                "location": { "$ref": "#/viewDefinitions/location" },
                "normal": { "$ref": "#/viewDefinitions/direction" },
                "up": { "$ref": "#/viewDefinitions/direction" },
                "height": { "type": "number" }
            }
        }
    },

    "viewpoint": {
        "type": "object",
        "properties": {
            "guid": { "type": "string" },
            "orthogonalCamera": { "$ref": "#/viewDefinitions/orthogonalCamera" },
            "perspectiveCamera": { "$ref": "#/viewDefinitions/perspectiveCamera" },
            "clippingPlanes": { "type": ["array", "null"], "items": { "$ref": "#/viewDefinitions/clippingPlane" } },

            // Any additional properties go here
            "fluxProperties": { "type": "object" },

            // Additional fields for BCF compliance; we do not expect to use these in the short term
            "index": { "type": [ "integer", "null" ] },
            "lines": { "type": [ "array", "null" ], "items": { "$ref": "#/viewDefinitions/line" } },
            "bitmaps": { "type": [ "array", "null" ], "items": { "$ref": "#/viewDefinitions/bitmap" } },
            "snapshot": {
                "type": [ "object", "null" ],
                "properties": { "snapshotType": { "$ref": "#/viewDefinitions/imageType" } }
            }
        },
        "required": [ "guid" ]
    },

    "topic": {
        "type": "object",
        "properties": {
            "guid": { "type": "string" },
            "topicType": { "$ref": "#/definitions/topicType" },
            "topicStatus": { "$ref": "#/definitions/topicStatus" },
            "title": { "type": "string" },
            "description": { "type": [ "string", "null" ] },
            "creationDate":    { "type": "string" },
            "creationAuthor":  { "type": "string" },
            "modifiedDate":    { "type": "string" },
            "modifiedAuthor":  { "type": [ "string", "null" ] },
            // The file(s) that contain the BIM object(s)
            "bimSnippet": { "$ref": "#/definitions/bimSnippet" },

            // Any additional properties go here
            "fluxProperties": { "type": "object" },


            // Additional fields for BCF compliance; we do not expect to use these in the short term
            "referenceLinks": { "type": [ "array", "null" ], "items": [ "string", "null" ] },
            "priority": { "type": [ "string", "null" ] },
            "index": { "type": [ "integer", "null" ]},
            "labels": { "type": [ "array", "null" ], "items": [ "string", "null" ] },
            "assignedTo": { "type": [ "string", "null" ] },
            "stage": { "type": [ "string", "null" ] },
            "dueDate": { "type": [ "string", "null" ] },
            "authorization": {
                "type": "object",
                "properties": {
                    "topicActions": { "type": [ "array", "null" ], "items": [ "string", "null" ] },
                    "topicStatus": { "type": [ "array", "null" ], "items": [ "string", "null" ] }
                }
            }


        },
        "required": [ "guid", "title", "creationDate", "creationAuthor" ]
    }
};

export default fluxBCF;