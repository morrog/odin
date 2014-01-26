describe("The Model", function() {

    var Model = require("../src/model.js"),
        Base = require("../src/base.js");

    it("Should inherit from the Base class", function() {
        expect(new Model instanceof Base).toBe(true);
    });

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