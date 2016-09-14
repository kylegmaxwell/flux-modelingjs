describe("Operations", function() {
    'use strict';
    var modeling = require("../dist/index.js");

    it("should throw errors when given the wrong number of arguments",
        function() {
            expect(
                function() { var o = modeling.Operation.evalMassProps();}
            ).toThrow();

            expect(
                function() { var o = modeling.Operation.evalMassProps(1, 2, 3);}
            ).toThrow();

            // Shouldn't throw
            var o = modeling.Operation.evalMassProps(1);
        });

})
