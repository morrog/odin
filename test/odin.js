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

    it("Should not set global on window when not running in browser", function() {
        try {
            if (window !== undefined) {
                expect(window.Odin).toBeUndefined();
            }
        } catch(e) {
            // Do nothing, we just want to catch reference errors.
        }
    });

    it("Should set globals on window when in a browser", function() {
        process.env.TEST = true;
        GLOBAL.window = {};
        GLOBAL.$ = {};

        Odin.defineMe(true);

        expect(window.Odin).toBeDefined();
    });

    it("Should not allow defining it self multiple times", function() {
        process.env.TEST = "";
        expect(Odin.defineMe()).toBe(false);
    });
});