var Base = require("./base"),
	Injector = require("./injector"),
    Model = require("./model"),
    Validator = require("./validator"),
    Storage = require("./storage"),
    LocalStorage = require("./localStorage");

module.exports = {
    Base: Base,
    Injector: Injector,
    Model: Model,
    Validator: Validator,
    Storage: Storage,
    LocalStorage: LocalStorage
};

if(process.browser) {
    window.Odin = module.exports;

    
    Injector.static("window", window);
    Injector.static("window.localStorage", window.localStorage);
    
    Injector.static("$", $);
    Injector.static("ajax", $.ajax);
} else {
	// Require REST service and other node.js schtuff here
}

// Expose Odin as an amd module
Base.defineMe.call(module.exports);