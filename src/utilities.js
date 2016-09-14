'use strict';

/** Helper function to determine if an object is an entity. Does not validate
    the entity.
    @private
    @param  {object}   obj     potential entity
    @return {bool}             Entity or any other type specified by OptCtor
*/
export function isEntity(obj) {
    return obj.primitive != null;
}
