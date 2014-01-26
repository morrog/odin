describe("The index file", function() {

    it("Should include the Base class", function() {
        var index = require("../src/index.js"),
            Base = require("../src/base.js");

        expect(index.Base).toBe(Base);
    });

    it("Should include the Model class", function() {
        var index = require("../src/index.js"),
            Model = require("../src/model.js");

        expect(index.Model).toBe(Model);
    });
});