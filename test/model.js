describe("The Model", function() {
    "use strict";

    var Model = require("../src/model"),
        Base = require("../src/base"),
        Validator = require("../src/validator");

    it("Should inherit from the Base class", function() {
        expect(new Model() instanceof Base).toBe(true);
    });

    describe("Creation", function() {
        it("Should set the properties upon creation", function() {
            var value = "bar",
                model = new Model({ foo: value });

            expect(model.foo).toBe(value);
        });

        it("Should merge default properties with passed properties", function() {
            var Derived = Model.extend({
                    properties: {
                        foo: "bar",
                        bar: "foo"
                    }
                }),
                value = "foobar",
                model = new Derived({ foo: value });

            expect(model.foo).toBe(value);
            expect(model.bar).toBe("foo");
        });
    });

    describe("Set", function() {
        it("Should be able to set a hash of properties", function() {
            var model = new Model(), key,
                properties = { foo: "bar", bar: "foo" };

            model.set(properties);

            for(key in properties) {
                expect(model[key]).toBe(properties[key]);
            }
        });

        it("Should broadcast changes", function() {
            var model = new Model({ foo: "bar" }),
                handler = jasmine.createSpy("handler");

            model.on("change", handler)
                 .on("change:foo", handler);

            model.foo = "foobar";

            expect(handler).toHaveBeenCalled();
            expect(handler).toHaveBeenCalledWith("foobar", "bar");
            expect(handler.calls.length).toBe(2);
        });

        it("Should be able to silence the change broadcast", function() {
            var model = new Model({ foo: "bar" }),
                handler = jasmine.createSpy("handler");

            model.on("change:foo", handler);

            model.set("foo", "foobar", { silent: true });

            expect(handler).not.toHaveBeenCalled();
        });

        it("Should not broadcast setting a value equal to the previous value", function() {
            var model = new Model({ foo: "bar" }),
                handler = jasmine.createSpy("handler");

            model.on("change:foo", handler);

            model.foo = "bar";

            expect(handler).not.toHaveBeenCalled();
            expect(model.changed.foo).toBeUndefined();
        });

        it("Should default the primary key to 'id'", function() {
            var model = new Model({ id: 1 });

            expect(model.id).toBe(1);
        });

        it("Should set the primary key", function() {
            var MyModel = Model.extend({ primary: "theId" }),
                model = new MyModel({ theId: 1 });

            expect(model.id).toBe(model.theId);
        });

        it("Should store the previous properties when changing", function() {
            var properties = { id: 1, foo: "bar" },
                model = new Model(properties);

            model.foo = "foobar";

            expect(model.previousProperties).toEqual(properties);
        });

        it("Should track changes", function() {
            var model = new Model({ foo: "bar" });

            model.foo = "foobar";

            expect(model.changed.foo).toBe("bar");
        });
    });

    describe("Mutation", function() {
        it("Should provide a way to mutate properties before setting", function() {
            var MyModel = Model.extend({
                    properties: { foo: "" },
                    mutators: { foo: function(value) { return value !== undefined ? value + "!" : this.properties.foo; } }
                }),
                model = new MyModel({ foo: "foobar" });

            expect(model.foo).toBe("foobar!");
        });

        it("Should provide a way to mutate properties before getting", function() {
            var MyModel = Model.extend({
                    properties: { foo: "" },
                    mutators: { foo: function(value) { return value === undefined ? this.properties.foo + "?" : value; } }
                }),
                model = new MyModel({ foo: "foobar" });

            expect(model.foo).toBe("foobar?");
            expect(model.properties.foo).toBe("foobar");
        });

        it("Should provide a way to mutate properties before gettin and setting", function() {
            var MyModel = Model.extend({
                    properties: { foo: "" },
                    mutators: {
                        foo: {
                            get: function() { return this.properties.foo + "!"; },
                            set: function(value) { return value.replace("?", ""); }
                        }
                    }
                }),
                model = new MyModel({ foo: "foobar?" });

            expect(model.foo).toBe("foobar!");
            expect(model.properties.foo).toBe("foobar");
        });

        it("Should include mutators when getting a plain object representation of the model", function() {
            var foo = "bar",
                MyModel = Model.extend({
                    mutators: {
                        foo: function() { return foo; }
                    }
                }),
                model = new MyModel();

            expect(model.toObject().foo).toBe(foo);
        });
    });
    
    describe("Unset", function() {
        it("Should be able to unset properties", function() {
            var model = new Model({ foo: "bar" });

            model.unset("foo");

            expect(model.foo).toBeUndefined();
        });

        it("Should broadcast events when unsetting a property", function() {
            var model = new Model({ foo: "bar" }),
                handler = jasmine.createSpy("handler");

            model.on("unset:foo", handler)
                 .on("change", handler);

            model.unset("foo");

            expect(handler).toHaveBeenCalledWith("bar");
            expect(handler.calls.length).toBe(2);
        });

        it("Should be able to silence event broadcast when unsetting a property", function() {
            var model = new Model({ foo: "bar" }),
                handler = jasmine.createSpy("handler");

            model.on("unset:foo", handler)
                 .on("change", handler);

            model.unset("foo", { silent: true });

            expect(handler).not.toHaveBeenCalled();
        });

        it("Should be able to unset an array of properties", function() {
            var model = new Model({ foo: "bar", bar: "foo" });

            model.unset(["foo", "bar"]);

            expect(model.foo).toBeUndefined();
            expect(model.bar).toBeUndefined();
        });

        it("Should be able to unset a space seperated list of properties", function() {
            var model = new Model({ foo: "bar", bar: "foo" });

            model.unset("foo bar");

            expect(model.foo).toBeUndefined();
            expect(model.bar).toBeUndefined();
        });
    });

    describe("Validation", function() {
        it("Should have a validation property that inherits from Odin.Validator", function() {
            var model = new Model();

            expect(model.validator instanceof Validator).toBe(true);
        });

        it("Should not allow invalid values to be set on construction", function() {
            var MyModel = Model.extend({
                    rules: { foo: { required: true } }
                }),
                model = new MyModel({ foo: ""});

            expect(model.foo).toBeUndefined();
        });

        it("Should not allow invalid values to be set", function() {
            var MyModel = Model.extend({
                    rules: { foo: { required: true } }
                }),
                model = new MyModel({ foo: "bar" });

            model.foo = "";

            expect(model.foo).toBe("bar");
        });
    });

    it("Should be able to get an array of the property keys", function() {
        var model = new Model({ foo: "bar", bar: "foo" });

        expect(model.keys()).toEqual(["foo", "bar"]);
    });

    it("Should be able to get an array of propery values", function() {
        var model = new Model({ foo: "bar", bar: "foo" });

        expect(model.values()).toEqual(["bar", "foo"]);
    });

    it("Should be able to get a hash of the properties", function() {
        var properties = { foo: "bar", bar: "foo" },
            model = new Model(properties);

        expect(model.toObject()).toEqual(properties);
    });

    it("Should be able to get a JSON string of the properties", function() {
        var json = '{"foo":"bar"}',
            model = new Model(JSON.parse(json));

        spyOn(model, "toObject").andCallThrough();

        expect(model.toJSON()).toEqual(json);
        expect(model.toObject).toHaveBeenCalled();
    });

    it("Should be clonable", function() {
        var model = new Model({ foo: "bar" }),
            clone = model.clone();

        expect(clone instanceof Model).toBe(true);
        expect(clone.toObject()).toEqual(model.toObject());
    });

});