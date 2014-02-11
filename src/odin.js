var Base = require("./base"),
    Injector = require("./injector"),
    Model = require("./model"),
    Validator = require("./validator"),
    Storage = require("./storage"),
    LocalStorage = require("./localStorage"),
    defined = false;

module.exports = {
    defineMe: function(isBrowser) {
        if(defined && !process.env.TEST) {
            return;
        }

        defined = true;

        // Expose Odin as an amd module
        Base.defineMe.call(module.exports);

        if(isBrowser) {
            window.Odin = module.exports;

            Injector.static("window", window);
            Injector.static("window.localStorage", window.localStorage);

            Injector.static("$", $);
            Injector.static("ajax", $.ajax);
        } else {
            // Require REST service and other node.js schtuff here
        }
    },
    Base: Base,
    Injector: Injector,
    Model: Model,
    Validator: Validator,
    Storage: Storage,
    LocalStorage: LocalStorage
};

module.exports.defineMe(process.browser !== undefined);