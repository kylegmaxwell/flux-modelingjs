# Disclaimer
***This module is under active development. Use with caution and no expectation of stability.***

# flux-modelingjs
Module used to create Flux JSON entities and modeling operations to send to the
Parasolid Block Worker (PBW). There are two main variants of the library.
index.js - compiled by babel into the dist directory - npm run build-common
index-lite.js - referenced by jsnext:main for external modules that build with rollup-test
                Also, this version does not include the units of measure emscripten compiled module

### Measure
Units-of-Measure support lib converts units from one measure to another.
For examples convert meters to feet. Emscripten build artifact is check in
under the lib directory.

### Schema
Flux schemas for JSON containing entities, revit elements, scene elements and materials are in the schema directory.

### Testing
Simply use

    npm install && npm test

## Pull requests
Currently code review is handled by gerrit, not pull requests.
If you would like to contribute to this repository please email support@flux.io
