'use strict';

/**
 * This test uses a module built by rollup to ensure that this workflow is
 * maintained, as other repositories rely on it.
 */
describe("Status map test", function() {
    'use strict';

    var modeling = require("../dist/index.js");

    it ("Should merge", function() {
        var a = new modeling.scene.StatusMap();
        var b = new modeling.scene.StatusMap();
        b.appendError('sphere','Failure');
        expect(a.invalidKeySummary()).toEqual('');
        expect(b.invalidKeySummary()).toEqual('sphere (Failure)');
        a.appendValid('sphere');
        a.merge(b);
        expect(a.invalidKeySummary()).toEqual('sphere (Failure)');
    });
});
