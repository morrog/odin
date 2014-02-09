var Storage = require("./storage"),
	Injector = require("./injector"),

LocalStorage = module.exports = Storage.extend({

	inject: {
		"localStorage": "localStorage"
	}

});

Injector.set("localStorage", LocalStorage);