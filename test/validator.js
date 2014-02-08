describe("The Validator class", function() {
    "use strict";
    
    var Validator = require("../src/validator"),
        Base = require("../src/base"),
        object = require("mout/object");

    it("Should be defined", function() {
        expect(Validator).toBeDefined();
    });

    it("Should inhert from the Base class", function() {
        expect(new Validator() instanceof Base).toBe(true);
    });

    it("Should retain default rules when extending", function() {
        var myRules = { foo: function() {} },
            MyValidator = Validator.extend({ rules: myRules }),
            validator = new MyValidator();

        expect(object.matches(validator.rules, myRules)).toBe(true);
        expect(object.matches(validator.rules, Validator.prototype.rules)).toBe(true);
    });

    describe(".run()", function() {
        it("Should run a set of rules on a set of properties", function() {
            var rules = { foo: { required: true }, bar: { number: true } },
                invalid = { foo: "", bar: "not a number" },
                valid = { foo: "bar", bar: 123 },
                validator = new Validator();

            expect(validator.run(rules, invalid)).toBe(false);
            expect(validator.run(rules, valid)).toBe(true);
        });

        it("Should broadcast events for invalid properties", function() {
            var rules = { foo: { required: true }, bar: { number: true } },
                props = { foo: "", bar: "not a number" },
                validator = new Validator(),
                handler = jasmine.createSpy("handler");

            validator.on("invalid:foo", handler)
                      .on("invalid:bar", handler)
                      .on("invalid", handler);

            validator.run(rules, props);

            expect(handler.calls.length).toBe(3);
            expect(handler).toHaveBeenCalledWith(["required"]);
            expect(handler).toHaveBeenCalledWith(["number"]);
            expect(handler).toHaveBeenCalledWith({ foo: ["required"], bar: ["number"]});
        });

        it("Should be silencable", function() {
            var rules = { foo: { required: true }, bar: { number: true } },
                props = { foo: "", bar: "not a number" },
                validator = new Validator(),
                handler = jasmine.createSpy("handler");

            validator.on("invalid:foo", handler)
                      .on("invalid:bar", handler)
                      .on("invalid", handler);

            validator.run(rules, props, { silent: true });

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe("Default rules", function() {
        it("Should validate required", function() {
            var validator = new Validator(),
                rules = { foo: { required: true } },
                invalid = { foo: "" },
                valid = { foo: "bar" };

            expect(validator.run(rules, invalid)).toBe(false);
            expect(validator.run(rules, valid)).toBe(true);
        });

        it("Should validate number", function() {
            var validator = new Validator(),
                rules = { foo: { number: true } },
                invalid = { foo: "" },
                valid = { foo: 123 };

            expect(validator.run(rules, invalid)).toBe(false);
            expect(validator.run(rules, valid)).toBe(true);
        });

        it("Should validate min length", function() {
            var validator = new Validator(),
                rules = { foo: { minLength: 8 } },
                invalid = { foo: "1234567" },
                valid = { foo: 12345678 };

            expect(validator.run(rules, invalid)).toBe(false);
            expect(validator.run(rules, valid)).toBe(true);
        });

        it("Should validate max length", function() {
            var validator = new Validator(),
                rules = { foo: { maxLength: 8 } },
                invalid = { foo: "123456789" },
                valid = { foo: "12345678" };

            expect(validator.run(rules, invalid)).toBe(false);
            expect(validator.run(rules, valid)).toBe(true);
        });

        it("Should validate exact length", function() {
            var vaidator = new Validator(),
                rules = { foo: { exactLength: 8 } },
                invalid = { foo: "123456789" },
                valid = { foo: "12345678" };

            expect(vaidator.run(rules, invalid)).toBe(false);
            expect(vaidator.run(rules, valid)).toBe(true);
        });

        it("Should validate range", function() {
            var validator = new Validator(),
                rules = { foo: { range: [ 5, 10 ] } },
                invalid = { foo: "I don't think this is less then 10 characters?" },
                valid = { foo: "This is" };

            expect(validator.run(rules, invalid)).toBe(false);
            expect(validator.run(rules, valid)).toBe(true);
        });

        it("Should validate int", function() {
            var validator = new Validator(),
                rules = { foo: { int: true } },
                invalid = { foo: 123.123 },
                valid = { foo: 123 };

            expect(validator.run(rules, invalid)).toBe(false);
            expect(validator.run(rules, valid)).toBe(true);
        });

        it("Should validate float", function() {
            var validator = new Validator(),
                rules = { foo: { float: true } },
                invalid = { foo: 123 },
                valid = { foo: 123.123 };

            expect(validator.run(rules, invalid)).toBe(false);
            expect(validator.run(rules, valid)).toBe(true);
        });

        it("Should validate equals", function() {
            var validator = new Validator(),
                rules = { foo: { equals: "bar" } },
                invalid = { foo: "Nope", bar: "Yep" },
                valid = { foo: 123, bar: "123" };

            expect(validator.run(rules, invalid)).toBe(false);
            expect(validator.run(rules, valid)).toBe(true);
        });

        it("Should validate is", function() {
            var validator = new Validator(),
                rules = { foo: { is: "bar" } },
                invalid = { foo: 123, bar: "123" },
                valid = { foo: "123", bar: "123" };

            expect(validator.run(rules, invalid)).toBe(false);
            expect(validator.run(rules, valid)).toBe(true);
        });

        it("Should validate regexp", function() {
            var validator = new Validator(),
                rules = { foo: { regexp: /^[a-c]+$/ } },
                invalid = { foo: "abcd" },
                valid = { foo: "acb" };

            expect(validator.run(rules, invalid)).toBe(false);
            expect(validator.run(rules, valid)).toBe(true);
        });

        it("Should validate email", function() {
            var validator = new Validator(),
                rules = { foo: { email: true } },
                invalid = { foo: "martin@forre" },
                valid = { foo: "martin@forre.com" };

            expect(validator.run(rules, invalid)).toBe(false);
            expect(validator.run(rules, valid)).toBe(true);
        });

        it("Should validate url", function() {
            var validator = new Validator(),
                rules = { foo: { url: true } },
                invalid = { foo: "http://www.test." },
                valid = { foo: "http://www.test.com" };

            expect(validator.run(rules, invalid)).toBe(false);
            expect(validator.run(rules, valid)).toBe(true);
        });
    });

});