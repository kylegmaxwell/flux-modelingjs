'use strict';
/*  @class
    @classdesc Named operation slot
 */
export default function OpSlot(name, op) {
    this.name = name;
    this.operation = op;
}
OpSlot.prototype.toJSON = function () {
    return {
        name: this.name,
        op:   this.operation.toJSON()
    };
};
