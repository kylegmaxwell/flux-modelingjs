describe("Operations", function() {
    'use strict';
    var modeling = require("../index").modeling();

    describe("should throw errors when given the wrong number of arguments",
        function() {
            expect(
                function() { var o = modeling.operations.evalMassProps();}
            ).toThrow();

            expect(
                function() { var o = modeling.operations.evalMassProps(1, 2, 3);}
            ).toThrow();

            // Shouldn't throw
            var o = modeling.operations.evalMassProps(1);
        });

})