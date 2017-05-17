var material = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "materialProperties": {
        "type": "object",
        "properties": {
            "color":            { "$ref": "fluxEntity#/types/color" },
            "reflectivity":     { "$ref": "fluxEntity#/types/unitNumber" },
            "glossiness":       { "$ref": "fluxEntity#/types/unitNumber" },
            "transparency":     { "$ref": "fluxEntity#/types/unitNumber" },
            "transparencyIOR":      {
                "type":     "number",
                "minimum":  0
            },
            "emissionColor":    { "$ref": "fluxEntity#/types/color" },
            "transparencyColor":{ "$ref": "fluxEntity#/types/color" },
            "reflectivityColor":{ "$ref": "fluxEntity#/types/color" }
        },
        "additionalProperties": true
    }
};
export default material;
