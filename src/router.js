var Base = require("./base"),
    Injector = require("./injector"),
    bind = require("mout/function/bind"),
    ltrim = require("mout/string/ltrim"),
    mixIn = require("mout/object/mixIn"),

Router = module.exports = Base.extend({

    url: "/",
    history: [],

    inject: {
        window: "window"
    },

    constructor: function() {
        this.history = [];
        this._resolveDependencies();
        
        this.url = this.getHash() || this.url;

        this.window.addEventListener("hashchange", bind(this.hashchange, this));
        Router.super_.apply(this, arguments);
    },

    hashchange: function() {
        this.history.push(this.url);
        mixIn(this, this.getRoute());
        this.trigger("change", this.url);
    },

    getHash: function() {
        return Router.parseHash(this.window.location.hash);
    },

    getRoute: function() {
        return Router.parseUrl(this.getHash());
    }

}, {
    parseHash: function(hash) {
        hash = hash.replace("#", "");
        hash = hash.indexOf("/") !== 0 ? "/" + hash : hash;
        return hash;
    },

    parseUrl: function(url) {
        var route = {};
        route.url = url;
        route.segments = ltrim(url, ["/"]).split("/");

        return route;
    }
});

Injector.single("Router", Router.defineMe());