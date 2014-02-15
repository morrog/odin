var Base = require("./base"),
    Injector = require("./injector"),
    bind = require("mout/function/bind"),

Router = module.exports = Base.extend({

    url: "/",
    history: [],
    baseController: null,

    inject: {
        window: "window"
    },

    constructor: function() {
        this.history = [];
        this._resolveDependencies();
        
        this.url = this.getUrl() || this.url;

        this.window.addEventListener("hashchange", bind(this.hashchange, this));
        Router.super_.apply(this, arguments);
    },

    hashchange: function() {
        var route;

        this.history.push(this.url);

        route = this.getRoute();
        this.url = route.url;
        this.segments = route.segments;

        this.resolveController();

        this.trigger("change", this.url);
    },

    resolveController: function() {
        var name = "/" + this.segments[0],
            BaseController = Injector.get(name);

        if(!BaseController) {
            return;
        }

        if(!(this.baseController instanceof BaseController)) {
            this.baseController = new BaseController(this);
        }

        this.baseController.resolve(this.segments.slice());
    },

    back: function() {
        var url = this.history[this.history.length - 1];

        if(url) {
            this.window.location.hash = this.history[this.history.length - 1];
        }

        return this;
    },

    goto: function(url) {
        this.window.location.hash = url;
        return this;
    },

    getUrl: function() {
        return Router.parseHash(this.window.location.hash);
    },

    getRoute: function() {
        return Router.parseUrl(this.getUrl());
    },

}, {
    parseHash: function(hash) {
        hash = hash.replace("#", "");
        hash = hash.indexOf("/") !== 0 ? "/" + hash : hash;
        return hash;
    },

    parseUrl: function(url) {
        var route = {};
        route.url = url;
        route.segments = url.split("/");
        route.segments.shift();

        return route;
    }
});

Injector.single("Router", Router.defineMe());