// Inherit one type from another, adding methods via prototype object
// TODO(andrew): once https://vannevar.atlassian.net/browse/LIB3D-623 lands,
// I think that we can remove all use of inherit and the remaining pseudoclasses.
// Inherit one type from another, adding methods via prototype object
function inherit(clazz, base, proto) {
    clazz.prototype = Object.create(base.prototype);
    clazz.prototype.constructor = clazz;
    if (proto)
        Object.keys(proto).forEach(
            function (key) {
                clazz.prototype[key] = proto[key];
            }
        );
}
/** @class Throwable

    More universal error type than Error
    * supports JS inheritance
    * can capture stack trace properly
    * supports exception chaining, i.e. 'error causes'

    Important!
    Any subclass of Throwable MUST invoke 'this.captureStackTrace()'
    in its constructor BEFORE invoking super's constructor
    This will ensure that stack trace will be properly captured
    Calling 'this.captureStackTrace()' multiple times on the same object
    will do no harm, as only the first call will initialize 'stack' property
 */
function Throwable(message) {
    this.captureStackTrace();
    this.message = (message || "");
}

Throwable.prototype = new Error();
Throwable.prototype.constructor = Throwable;

Throwable.prototype.causedBy = function (cause) {
    this.cause = cause;
    return this;
}
Throwable.prototype.toString = function () {
    return this.constructor.name + (this.message ? ': ' + this.message : '');
};
// This method must be invoked in each descendant class' constructor
// befor calling down to super's ctor.
// Such approach gives us loss of only 2 stack frames
Throwable.prototype.captureStackTrace = function () {
    // If already initialized, return just here
    if (this.hasOwnProperty("stack"))
        return;
    // I know this is usually a bad idea.
    // Though I have no better way to capture stacktraces
    // in platform-independent way
    // I hope V8's Error.captureStackTrace will become kind of standard someday
    var tmp = new Error();
    Object.defineProperty(this, "stack", {
        configurable: true,
        enumerable:   false,
        get: function () {
            // first, capture trace as string
            var trace = tmp.stack.slice(6); // cut 'Error\n' just here
            // next, eliminate first 2 frames
            // captureStackTrace frame
            // and constructor frame
            var mid = trace.indexOf('\n');
            mid = trace.indexOf('\n', mid + 1);
            trace = trace.slice(mid + 1);
            // lastly, compose with this exception's toString
            trace = this.toString() + '\n' + trace;
            if (this.cause)
                trace += '\n*caused by ' + this.cause.stack;
            Object.defineProperty(this, "stack", {
                enumerable: false,
                writable:   false,
                value:      trace
            });
            return trace;
        }
    });
};

function FluxModelingError(message) {
    this.captureStackTrace();
    Throwable.call(this, message || 'Invalid or degenerate geometry specified');
}
inherit(FluxModelingError, Throwable);

module.exports = {
    Throwable:          Throwable,
    inherit:            inherit,
    FluxModelingError:  FluxModelingError
};
