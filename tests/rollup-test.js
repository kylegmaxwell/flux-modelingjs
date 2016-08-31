import * as schemaJson from '../schemas/flux-entity.json';

import modelingFunc from '../modeling.js';
var modeling = modelingFunc({'skip':true});

export function getModeling() {
    return modeling;
};

export function getSchema() {
    return schemaJson;
};