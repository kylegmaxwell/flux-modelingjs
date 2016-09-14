'use strict';

var modeling    = require('../dist/index.js');
// Tests non public API
var types = require('../dist/types.js');
var s = types.helpers;
var checkAll = types.checkAll;
var checkAllAndThrow = types.checkAllAndThrow;


describe("typechecking", function() {
    'use strict';

    it("Should checkall correctly", function() {
        var result = checkAll(["MyNumber", s.Number, 1.234]);
        expect(result).toEqual([undefined]);

        result = checkAll(["MyNumber", s.Number, "foo"]);
        expect(result).toNotEqual([undefined]);

        result = checkAll(["N1", s.Number, 1.2345],
                            ["N2", s.Number, 1.2345]);
        expect(result).toEqual([undefined, undefined]);
    });

    it("Should throw errors when asked to",function() {
        var result = checkAllAndThrow(["MyNumber", s.Number, 1.234]);
        expect(result).toEqual(undefined);

        expect(function(){
            return checkAllAndThrow(["MyNumber", s.Number, "foo"]);
        }).toThrow();
    });

    it("Should check AnyOf and Maybe correctly", function() {
        expect(checkAll(["N1", s.AnyOf(s.Number, s.String), "foo"])).toEqual([undefined]);
        expect(checkAll(["N1", s.AnyOf(s.Number, s.String), 1.23])).toEqual([undefined]);
        expect(checkAll(["N1", s.AnyOf(s.Number, s.String), []])[0]).toContain("a number or a string");
    });

    it("Should check entity and types inside the pbw schema", function() {
        var myPoint = modeling.geometry.point([0,0,0]);
        var myVector= modeling.geometry.vector([0,0,1]);

        expect(checkAll(["v1", s.Entity("vector"), myVector])).toEqual[undefined];
        expect(checkAll(["v1", s.Entity("vector"), myPoint])[0]).toContain("vector");
        expect(checkAll(["p1", s.Type("position"), [0,1,2]])).toEqual([undefined]);
        expect(checkAll(["p1", s.Type("position"), [0,1,2,3]])[0]).toContain("position");
    });

    it("Should handle nulls and undefined values", function() {
        expect(checkAll(["N1", s.Maybe(s.Number), undefined])).toEqual([undefined]);
        expect(checkAll(["N1", s.Maybe(s.Number), null])).toEqual([undefined]);
        expect(checkAll(["N1", s.Maybe(s.Number), 123])).toEqual([undefined]);

        expect(checkAll(["N1", s.Maybe(s.Number), [] ])[0]).toContain("a number");

        expect(checkAll(["N1", s.Number, undefined])[0]).toContain("a number");
        expect(checkAll(["N1", s.Number, null])[0]).toContain("a number");
    });
});
