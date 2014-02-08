describe("The Odin.Injector", function() {

	var Injector = require("../src/injector");

	it("Should be defined", function (){
		expect(Injector).toBeDefined();
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
	});
});