'use strict';

export default function FluxModelingError(message) {
    this.name = 'FluxModelingError';
    this.message = message || 'Invalid or degenerate geometry specified.';
    this.stack = (new Error()).stack;
}
FluxModelingError.prototype = Object.create(Error.prototype);
FluxModelingError.prototype.constructor = FluxModelingError;
