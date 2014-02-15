describe("The Odin.Injector", function() {

    var Injector = require("../src/injector"),
        Base = require("../src/base");

    it("Should be defined", function (){
        expect(Injector).toBeDefined();
    });

    it("Should expose it self to AMD module loaders like RequireJS", function() {
        var define = global.define;

        global.define = jasmine.createSpy("define");
        global.define.amd = true;

        Injector.defineMe();

        expect(global.define).toHaveBeenCalledWith([], Injector);
        
        global.define = define;
    });

    describe("Setting", function() {
        it("Should set dependencies", function() {
            var foo = function() { };

            Injector.set("foo", foo);
            expect(Injector.dependencies.foo.factory).toBe(foo);
        });

        it("Should add dependencies with arguments", function() {
            var foo = function() { },
                args = ["foo", "bar"];

            Injector.set("foo", foo, args);
            expect(Injector.dependencies.foo.args).toBe(args);
        });

        it("Should be chainable", function() {
            expect(Injector.set()).toBe(Injector);
        });

        it("Should set singletons", function() {
            var foo = function() { }, result;

            Injector.single("foo", foo);
            result = Injector.get("foo");

            expect(result instanceof foo).toBe(true);
            expect(Injector.get("foo")).toBe(result);
        });

        it("Should add static values", function() {
            var foo = "foo";

            Injector.static("foo", foo);

            expect(Injector.get("foo")).toBe(foo);
        });

        it("Should add values to be required", function() {
            var name = "base";

            Injector.require(name, "base");

            expect(Injector.get(name) instanceof Base).toBe(true);
        });

        it("Should add singleton values to be required", function() {
            var name = "base",
                base;

            Injector.requireSingle(name, "base");

            base = Injector.get(name);

            expect(base instanceof Base).toBe(true);
            expect(Injector.get(name)).toBe(base);
        });

        it("Should add values to be required without the root path prefix", function() {
            var name = "base";

            Injector.require(name, "!../src/base");

            expect(Injector.get(name) instanceof Base).toBe(true);
        });
    });

    describe("Getting", function() {
        it("Should get a new instance of the dependency", function() {
            var foo = function() { }, result;

            Injector.set("foo", foo);
            result = Injector.get("foo");

            expect(result instanceof foo).toBe(true);
            expect(Injector.get("foo")).not.toBe(result);
        });

        it("Should pass arguments to the dependency", function() {
            var foo = jasmine.createSpy("foo"),
                args = ["foo", "bar"];

            Injector.set("foo", foo, args);
            Injector.get("foo");

            expect(foo).toHaveBeenCalledWith(args[0], args[1]);
        });

        it("Should return null when asking for missing dependency", function() {
            expect(Injector.get("notThere", [])).toBe(null);
        });
    });
});