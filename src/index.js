var Base = require("./base.js"),
    Model = require("./model.js");

module.exports = Odin = {
    Base: Base,
    Model: Model
};

if(typeof define === "function" && define.amd) {
    define("Odin", function() {
        return module.exports;
    });
} else {
    try {
        window.Odin = module.exports;
    } catch(e){}
}