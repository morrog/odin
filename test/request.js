describe("The Odin.Request", function() {

	var Request = require("../src/request.js"),
		Base = require("../src/base.js");

	it("Should be defined", function() {
		expect(Request).toBeDefined();
	});

	it("Should inherit from Odin.Base", function() {
		expect(new Request() instanceof Base).toBe(true);
	});

});