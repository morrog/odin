var Base = require("./base"),
	Injector = require("./injector");

module.exports = Base.extend({

});

Injector.set("storage", module.exports.defineMe());