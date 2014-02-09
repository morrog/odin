describe("Odin.LocalStorage", function() {

	var Storage = require("../src/localStorage"),
		BaseStorage = require("../src/storage"),
		Injector = require("../src/injector"),
		ls = require('node-localstorage').LocalStorage;

	Injector.static("localStorage", new ls('./test/storage'));

	it("Should be defined", function() {
		expect(Storage).toBeDefined();
	});

	it("Should inherit from Odin.Storage", function() {
		expect(new Storage() instanceof BaseStorage).toBe(true);
	});

	it("Should depend on a localStorage implementation", function() {
		expect(new Storage().localStorage).toBe(Injector.get("localStorage"));
	});

});