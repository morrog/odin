describe("Odin", function() {
    "use strict";
    
    var Odin = require("../src/odin"),
        Base = require("../src/base"),
        Model = require("../src/model");

    it("Should include the Base class", function() {
        expect(Odin.Base).toBe(Base);
    });

    it("Should include the Model class", function() {
        expect(Odin.Model).toBe(Model);
    });
});