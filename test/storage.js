describe("Odin.Storage", function() {

	var Storage = require("../src/storage"),
		Base = require("../src/base");

	it("Should be defined", function() {
		expect(Storage).toBeDefined();
	});

	it("Should inherit from Odin.Base", function() {
		expect(new Storage() instanceof Base).toBe(true);
	});

});