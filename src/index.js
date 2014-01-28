var Base = require("./base.js"),
    Model = require("./model.js"),
    Validation = require("./validation.js"),
    Odin;

module.exports = Odin = {
    Base: Base,
    Model: Model,
    Validation: Validation
};

try {
    window.Odin = module.exports;
} catch(e){}