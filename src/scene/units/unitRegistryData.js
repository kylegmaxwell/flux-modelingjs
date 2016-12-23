var unitRegistry = {
    "dimensions": {
        "length": {
            "units": [
                ["angstroms", "angstrom", "A"],
                ["nanometers", "nanometer", "nm"],
                ["microns", "um", "micron"],
                ["millimeters", "mm", "millimeter"],
                ["centimeters", "cm", "centimeter"],
                ["decimeters", "decimeter", "dm"],
                ["meters", "m", "meter"],
                ["dekameters", "dekameter", "dam"],
                ["hectometers", "hectometer", "hm"],
                ["kilometers", "km", "kilometer"],
                ["megameters", "megameter", "Mm"],
                ["gigameters", "gigameter", "Gm"],
                ["mils", "mil"],
                ["inches", "inch", "in"],
                ["yards", "yard", "yd"],
                ["feet", "ft", "foot"],
                ["decifeet", "decifoot", "shrekles", "shrekle"],
                ["miles", "mile"],
                ["nautical miles", "nautical mile"],
                ["printer picas", "printer pica"],
                ["printer points", "printer point"],
                ["astronomical units", "astronomical unit", "au"],
                ["light years", "light year", "ly"],
                ["parsecs", "parsec", "pc"]
            ]
        },
        "area": {
            "units": [
                ["acres"],
                ["hectares"]
            ]
        },
        "volume": {
            "units": [
                ["liters", "liter", "l"],
                ["gallons", "gallon", "gal"]
            ]
        },
        "temperature": {
            "units": [
                ["farenheit", "F"],
                ["celsius", "C"],
                ["kelvin", "K"]
            ]
        },
        "time": {
            "units": [
                ["nanoseconds", "nanosecond", "ns"],
                ["microseconds", "microsecond", "us"],
                ["milliseconds", "milisecond", "ms"],
                ["seconds", "second", "s"],
                ["minutes", "minute"],
                ["hours", "hour", "h"],
                ["days", "day"],
                ["weeks", "week"],
                ["years", "year"]
            ]
        },
        "angle": {
            "units": [
                ["radians", "radian", "rad"],
                ["degrees", "degree", "deg"]
            ]
        },

        "mass": {
            "units": [
                ["grams", "gram", "g"],
                ["kilograms", "kilogram", "kg"],
                ["pounds", "pound", "lb"]
            ]
        },
        "force": {
            "units": [
                ["newtons", "newton"],
                ["pound-force", "lbf"]
            ]
        },
        "energy": {
            "units": [
                ["joules", "joule"],
                ["kwh", "kilowatt hour"]
            ]
        },
        "luminous-intensity": {
            "units": [
                ["candelas", "candela"]
            ]
        },
        "illumination": {
            "units": [
                ["lux", "lx"],
                ["foot-candles", "foot-candle", "fc"]
            ]
        },
        "luminous-flux": {
            "units": [
                ["lumen", "lm"]
            ]
        }
    },
    "conversions": [
        {"from":"angstroms", "to":"meters", "factor":1e-10},
        {"from":"nanometers", "to":"meters", "factor":1e-9},
        {"from":"microns", "to":"meters", "factor":1e-6},
        {"from":"millimeters", "to":"meters", "factor":1e-3},
        {"from":"centimeters", "to":"meters", "factor":1e-2},
        {"from":"decimeters", "to":"meters", "factor":1e-1},
        {"from":"dekameters", "to":"meters", "factor":10},
        {"from":"hectometers", "to":"meters", "factor":100},
        {"from":"kilometers", "to":"meters", "factor":1e3},
        {"from":"megameters", "to":"meters", "factor":1e6},
        {"from":"gigameters", "to":"meters", "factor":1e9},
        {"from":"mils", "to":"meters","factor":2.54e-5},
        {"from":"inches", "to":"meters","factor":0.0254},
        {"from":"yards", "to":"meters", "factor":0.9144},
        {"from":"feet", "to":"meters", "factor":0.3048},
        {"from":"decifeet", "to":"meters", "factor":0.03048},
        {"from":"miles", "to":"meters", "factor":1609.34},
        {"from":"nautical miles", "to":"meters", "factor":1852},
        {"from":"printer picas", "to":"meters", "factor":0.00423333},
        {"from":"printer points", "to":"meters", "factor":0.000352778},
        {"from":"astronomical units", "to":"meters", "factor":1.496e+11},
        {"from":"light years", "to":"meters", "factor":9.461e+15},
        {"from":"parsecs", "to":"meters", "factor":3.086e+16}
    ]
};
export default unitRegistry;
