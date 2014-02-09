var Base = require("./base"),
	Injector = require("./injector"),
    Model = require("./model"),
    Validator = require("./validator"),
    Storage = require("./storage");

module.exports = {
    Base: Base,
    Injector: Injector,
    Model: Model,
    Validator: Validator,
    Storage: Storage
};

if(process.browser) {
    Injector.static("$", $);
    Injector.static("window", window);

    window.Odin = module.exports;
} else {
	// Require REST service and other node.js schtuff here
}

// Expose Odin as an amd module
Base.defineMe.call(module.exports);