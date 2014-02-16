var Base = require("./base"),
    Injector = require("./injector"),
    functions = require("mout/object/functions"),
    filter = require("mout/collection/filter"),

Controller = module.exports = Base.extend({

    router: null,
    parent: null,
    ignore: false,
    el: null,

    inject: {
        $: "$"
    },

    constructor: function(router, segments, parent) {
        var initResult;

        this.router = router;
        this.segments = segments || [];
        this.parent = parent || null;

        this._resolveDependencies();

        if(!this.router) {
            this.ignore = true;
            return;
        }

        this._setEl(this.segments[0]);

        initResult = Base.call(this, router, parent);
        if(initResult === false) {
            this.ignore = true;
        } else if(typeof initResult === "string" && initResult.indexOf("/") === 0) {
            this.ignore = true;
            this.router.goto(initResult);
        }

        if(this.ignore) {
            return;
        }

        // Bind events here

        this.resolve(segments);
    },

    resolve: function(segments) {
        var routes,
            i = 0, len;
        
        if(this.ignore) {
            return;
        }

        this.segments = segments || [];

        /// If the only segment is the controller segment, then we need to call index
        if(this.segments.length === 1) {
            routes = this["/index"] ? ["/index"] : [];
        } else {
            routes = this._getRoutes();
        }

        for(len = routes.length; i < len; i++) {
            this._callRoute(routes[i]);
        }
    },

    _getRoutes: function() {
        return filter(functions(this), function(route) {
            var match = route.indexOf("/") === 0,
                segments = this.segments.slice(),
                url = "";

            // Remove the first segment (the controller)
            segments.shift();

            if(!match) {
                return false;
            }
            
            while(segments.length) {
                url += "/" + segments.shift();

                if(route === url && this[route].prototype instanceof Controller) {
                    return true;
                } else if(route.indexOf(url) !== 0 && route.indexOf(":") === -1) {
                    match = false;
                    break;
                }
            }
            
            if(match && url.split("/").length !== route.split("/").length) {
                match = false;
            }

            return match;
        }, this);
    },

    _callRoute: function(route) {
        var args = this._getArgs(route),
            controller, segments;

        if(!(this[route].prototype instanceof Controller)) {
            this._setEl(route.slice(1));

            return this._triggerEvent({
                handler: this[route],
                context: this
            }, args);
        }
        
        // Remove the sub controller segment
        segments = this.segments.slice();
        segments.shift();

        controller = new this[route](this.router, segments, this);
    },

    _getArgs: function(route) {
        var segments = route.split("/"),
            args = [],
            i = 0, len;

        segments.shift();

        for(len = segments.length; i < len; i++) {
            if(segments[i].indexOf(":") === 0) {
                args.push(this.segments[i + 1]);
            }
        }

        return args;
    },

    _setEl: function(name) {
        var el, context;
        name = "/" + (name || "");
        
        if(!this.$) {
            return;
        }
        
        if(this.el && this.el.is("[odin-controller]")) {
            el = this.el.find("[odin-route='" + name + "']");
        } else {
            context = this.parent && this.parent.el ? this.parent.el : false;
            el = this.$("[odin-controller='" + name + "']");
        }

        if(el.length) {
            this.el = el;
        }
    }

});

Injector.set("controller", Controller.defineMe());