var Base = require("./base"),
	Injector = require("./injector"),
    Model = require("./model"),
    Validator = require("./validator");

module.exports = {
    Base: Base,
    Injector: Injector,
    Model: Model,
    Validator: Validator
};

if(process.browser) {
    // Require zepto, views and other browser schtuff here
    Injector.static("$", $);

    window.Odin = module.exports;
} else {
	// Require REST service and other node.js schtuff here
}

// Expose Odin as an amd module
Base.defineMe.call(module.exports);